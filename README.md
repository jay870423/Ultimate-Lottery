# NeonLuck: 终极年会抽奖系统设计文档

## 1. 项目概述 (Overview)

**NeonLuck** 是一款专为公司年会、活动庆典设计的高端抽奖应用程序。它采用赛博朋克（Cyberpunk）视觉风格，结合现代 Web 技术，提供流畅的动画体验和震撼的音效。除了基础的随机抽奖功能外，系统还内置了管理员后台，支持 Excel 人员导入、奖品配置以及“内定”（Rigged）中奖逻辑，满足活动举办方的灵活需求。

## 2. 技术栈 (Tech Stack)

本项目采用现代前端工程化架构，确保高性能与易维护性：

*   **核心框架**: React 18 + TypeScript
*   **构建工具**: Vite
*   **样式库**: Tailwind CSS (利用 Utility-first 快速构建响应式与动画)
*   **字体**: Google Fonts (Orbitron 用于标题, Inter 用于正文)
*   **核心依赖**:
    *   `xlsx`: 处理 Excel 文件的导入与导出。
    *   `canvas-confetti`: 中奖时的庆祝礼花特效。
*   **部署兼容**: Vercel / Static Hosting

## 3. 系统架构 (Architecture)

应用为**单页应用 (SPA)**，采用无后端设计（Client-side Logic）。所有数据状态（人员、奖品、中奖记录）均存储在 React 组件的内存状态中。

### 3.1 目录结构
```text
/
├── index.html              # 入口 HTML (包含全局样式、Tailwind配置、外部脚本)
├── index.tsx               # React 挂载点
├── App.tsx                 # 根组件 (状态管理、路由逻辑、音频控制)
├── types.ts                # TypeScript 类型定义
├── constants.ts            # 默认配置数据 (模拟人员、默认奖品)
├── components/
│   ├── LotteryScreen.tsx   # 抽奖主屏幕组件 (动画、展示)
│   └── AdminPanel.tsx      # 管理员控制面板 (配置、导入导出)
└── utils/
    └── lotteryUtils.ts     # 核心工具函数 (抽奖算法、Excel处理、动画触发)


