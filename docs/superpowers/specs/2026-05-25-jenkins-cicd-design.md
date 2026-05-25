# Jenkins CI/CD 设计规格

## 概述

为五子棋前端项目（Vue 3 + Vite）搭建基于 Jenkins 的 CI/CD 流水线，实现代码提交后自动构建、测试、打包 Docker 镜像并部署到 Nginx 容器。

## 需求约束

| 约束 | 值 |
|------|-----|
| 项目类型 | Vue 3 + Vite 前端 SPA |
| 部署方式 | Docker 容器 + Nginx |
| 服务器 | Jenkins 与 Nginx 容器在同一台机器 |
| 环境数量 | 单环境 |
| 触发方式 | GitHub Webhook 自动触发（push 到 main）+ Jenkins UI 手动触发 |

## 流水线阶段设计

流水线包含 5 个阶段，按顺序执行，任一阶段失败则中止后续阶段：

```
Checkout → Install → Test → Build → Deploy
```

| 阶段 | 执行内容 | 失败处理 |
|------|---------|---------|
| Checkout | 从 Git 仓库拉取代码 | 中止流水线 |
| Install | `npm ci` 安装依赖（严格锁定版本） | 中止流水线 |
| Test | `npm run test:run` 运行 Vitest 单元测试 | 中止流水线，不构建不发版 |
| Build | `npm run build` 生成 dist + `docker build` 打包镜像 | 中止流水线 |
| Deploy | `docker stop` 旧容器 → `docker rm` → `docker run` 新容器 | 回滚到 latest 镜像 |

### 触发规则

- **自动触发**：push 到 `main` 分支时，通过 GitHub Webhook 触发，执行全部 5 个阶段
- **手动触发**：在 Jenkins UI 点击"Build Now"，执行全部 5 个阶段

### 部署参数

| 参数 | 值 |
|------|-----|
| Docker 镜像名 | `gomoku-web` |
| 容器名 | `gomoku-web-container` |
| 镜像标签策略 | `BUILD_NUMBER`（如 `gomoku-web:42`）+ `latest` |
| 容器端口映射 | `80:80` |

## Docker 与 Nginx 配置

### Dockerfile（多阶段构建）

```dockerfile
# 阶段一：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段二：生产镜像
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

预期镜像大小约 25MB（nginx:alpine 约 10MB + 静态文件）。

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 静态资源长缓存（Vite 构建的资源文件带内容 hash）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由回退 —— 所有路径都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

关键设计点：
- `try_files` 确保前端路由正常工作，页面刷新不会 404
- `/assets/` 开启长期缓存，Vite 构建的资源文件带有内容 hash，文件名变化即代表内容变化
- 隐藏文件（如 `.git`）禁止访问

### .dockerignore

排除无关文件，减小构建上下文体积：

```
node_modules
dist
.git
.vscode
docs
tests
.superpowers
```

## Jenkinsfile 流水线定义

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'gomoku-web'
        CONTAINER_NAME = 'gomoku-web-container'
        CONTAINER_PORT = '80'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test:run'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"
            }
        }
        stage('Deploy') {
            steps {
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p ${CONTAINER_PORT}:80 ${IMAGE_NAME}:${BUILD_NUMBER}
                """
            }
        }
    }

    post {
        success {
            echo '✅ 部署成功！'
        }
        failure {
            echo '❌ 构建失败，请检查日志'
            sh "docker stop ${CONTAINER_NAME} || true"
            sh "docker rm ${CONTAINER_NAME} || true"
            sh "docker run -d --name ${CONTAINER_NAME} -p ${CONTAINER_PORT}:80 ${IMAGE_NAME}:latest || true"
        }
    }
}
```

关键设计点：
- `npm ci` 比 `npm install` 更适合 CI，严格按照 `package-lock.json` 安装，速度更快
- 镜像使用 `BUILD_NUMBER` 作为版本标签，便于追溯；同时打 `latest` 标签用于回滚
- `docker stop/rm` 加 `|| true`，首次部署时容器不存在不会报错
- `post.failure` 中尝试用 `latest` 镜像重新启动容器，实现简单回滚

## Webhook 与 Jenkins 配置

### Jenkins 所需插件

| 插件 | 用途 |
|------|------|
| GitHub Integration Plugin | 提供 `githubPush()` 触发器 |
| Docker Pipeline | 支持 Docker 构建步骤 |

### Jenkins Job 配置步骤

1. 新建 Pipeline 类型项目
2. Pipeline → Definition 选择 **"Pipeline script from SCM"**
3. SCM 选择 Git，填入仓库地址
4. 勾选 **"GitHub hook trigger for GITScm polling"**

### GitHub Webhook 配置

1. 进入仓库 → Settings → Webhooks → Add webhook
2. Payload URL：`http://<服务器IP>:8080/github-webhook/`
3. Content type：`application/json`
4. Events：选择 **"Just the push event"**

## 新增文件清单

| 文件 | 用途 |
|------|------|
| `Jenkinsfile` | Jenkins 声明式流水线定义 |
| `Dockerfile` | 多阶段构建，生成 Nginx 生产镜像 |
| `nginx.conf` | Nginx 服务器配置（SPA 路由回退、静态资源缓存） |
| `.dockerignore` | 排除无关文件，减小 Docker 构建上下文 |
