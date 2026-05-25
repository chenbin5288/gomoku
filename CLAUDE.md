# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目状态

本项目目前处于设计阶段，尚未开始编写代码。刚刚完成了五子棋游戏的需求梳理和架构设计，详细设计规格见：

- `docs/superpowers/specs/2026-05-25-gomoku-design.md`

## 计划技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| Vite | 构建工具 |
| Canvas API | 棋盘和棋子绘制 |

## 常用命令（项目初始化后生效）

项目初始化完成后，预期常用命令如下（具体以实际 `package.json` 为准）：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目目录结构（规划中）

```
gomoku/
├── src/
│   ├── components/     # Vue 组件（GameBoard, GameInfo, StartDialog）
│   ├── game/           # 游戏核心逻辑（board.js, ai.js, patterns.js）
│   └── styles/         # 全局样式
└── docs/
    └── superpowers/specs/  # 设计规格文档
```

## AI 引擎架构要点

AI 采用**模式匹配 + Minimax 搜索**方案：
- 棋型模式定义在 `patterns.js`（连五、活四、冲四等，对应固定分值）
- 评估函数在 `ai.js`，综合攻击分和防守分（攻击权重 1.1 倍）
- 三个难度级别：简单（0 层搜索 + 30% 概率选次优）、中等（1-2 层 Minimax）、困难（2-3 层 + 棋型组合识别）
- 性能优化：只搜索已有棋子周围 2 格范围内的候选点
