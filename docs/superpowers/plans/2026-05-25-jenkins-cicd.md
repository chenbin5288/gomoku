# Jenkins CI/CD 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为五子棋前端项目搭建 Jenkins CI/CD 流水线，实现自动构建、Docker 打包和 Nginx 容器部署。

**Architecture:** 采用 Jenkinsfile 声明式流水线，Docker 多阶段构建将 Vue 应用打包进 Nginx Alpine 镜像，通过 stop/rm/run 方式实现零配置容器替换部署。

**Tech Stack:** Jenkins Pipeline、Docker、Nginx、Vue 3 + Vite

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `.dockerignore` | 排除无关文件，减小 Docker 构建上下文体积 |
| `nginx.conf` | Nginx 服务器配置（SPA 路由回退、静态资源缓存、隐藏文件禁止访问） |
| `Dockerfile` | 多阶段构建：阶段一用 Node 构建 dist，阶段二用 Nginx 提供静态文件服务 |
| `Jenkinsfile` | Jenkins 声明式流水线定义（Install → Test → Build → Deploy） |

## 依赖关系

```
.dockerignore  ─┐
                 ├──▶ Dockerfile ──▶ Jenkinsfile
nginx.conf ─────┘
```

- `.dockerignore` 和 `nginx.conf` 无依赖，可并行创建
- `Dockerfile` 依赖 `nginx.conf`（COPY nginx.conf）和 `.dockerignore`（优化构建上下文）
- `Jenkinsfile` 依赖 `Dockerfile`（docker build 步骤）

---

### Task 1: 创建 .dockerignore

**Files:**
- Create: `.dockerignore`

- [ ] **Step 1: 创建 .dockerignore 文件**

```
node_modules
dist
.git
.vscode
docs
tests
.superpowers
```

- [ ] **Step 2: 提交**

```bash
git add .dockerignore
git commit -m "ci: 添加 .dockerignore 排除无关文件，优化 Docker 构建上下文"
```

---

### Task 2: 创建 nginx.conf

**Files:**
- Create: `nginx.conf`

- [ ] **Step 1: 创建 nginx.conf 文件**

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

- [ ] **Step 2: 提交**

```bash
git add nginx.conf
git commit -m "ci: 添加 nginx.conf 配置（SPA 路由回退、静态资源缓存、隐藏文件禁止访问）"
```

---

### Task 3: 创建 Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: 创建多阶段构建 Dockerfile**

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

- [ ] **Step 2: 本地构建镜像验证**

运行：`docker build -t gomoku-web:test .`
预期：构建成功，无报错。

- [ ] **Step 3: 运行容器并验证服务**

运行：
```bash
docker run -d --name gomoku-web-test -p 8888:80 gomoku-web:test
curl -s -o /dev/null -w "%{http_code}" http://localhost:8888
```
预期：返回 `200`。

- [ ] **Step 4: 清理测试容器**

运行：
```bash
docker stop gomoku-web-test
docker rm gomoku-web-test
docker rmi gomoku-web:test
```

- [ ] **Step 5: 提交**

```bash
git add Dockerfile
git commit -m "ci: 添加 Dockerfile 多阶段构建（Node 构建 + Nginx Alpine 生产镜像）"
```

---

### Task 4: 创建 Jenkinsfile

**Files:**
- Create: `Jenkinsfile`

- [ ] **Step 1: 创建 Jenkins 声明式流水线**

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

- [ ] **Step 2: 提交**

```bash
git add Jenkinsfile
git commit -m "ci: 添加 Jenkinsfile 声明式流水线（Install → Test → Build → Deploy + 失败回滚）"
```
