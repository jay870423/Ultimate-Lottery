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
	
## 4. 数据模型 (Data Models)
### 4.1 参与者 (Participant)
interface Participant {
  id: string;        // 唯一标识 (工号或生成的ID)
  name: string;      // 姓名
  department?: string; // 部门
  avatar?: string;   // (可选) 头像URL
}
### 4.2 奖品 (Prize)
interface Prize {
  id: string;
  name: string;
  count: number;     // 该奖项总名额
  image?: string;    // Emoji 或 图片URL
  level: number;     // 奖项等级 (1为最高奖)
}
### 4.3 状态映射
*   WinnersMap: Record<string, Participant[]> - 记录每个奖项ID对应的已中奖人员列表。
*   RiggedMap: Record<string, string[]> - (敏感数据) 记录每个奖项ID对应的“内定”人员ID列表。

## 5. 功能模块详解
### 5.1 抽奖主界面 (Lottery Screen)
*   **视觉效果**:
    *   背景采用动态噪点与网格动画，营造科技感。
    *   中心区域为类似“老虎机”的快速滚动动画。
    *   当前奖项展示区带有霓虹光晕呼吸效果。
*   **交互逻辑**:
    *   Start: 触发快速滚动动画，播放激昂的鼓点音效 (Loop)。
    *   Stop: 停止动画，锁定中奖者，播放欢呼音效，触发全屏礼花 (Confetti)。
*   **状态展示**:
    *   实时显示剩余奖品数量。
    *   底部滚动显示当前奖项的已中奖名单。
### 5.2 后台管理面板 (Admin Panel)
通过主界面右上角的隐藏/图标按钮进入，包含三个核心标签页：
*   **人员名单 (Users)**:
    *   Excel 导入: 支持 .xlsx, .csv 格式。自动映射 Name, Department, ID 列。
    *   列表预览: 展示当前池内所有参与者。
    *   结果导出: 将中奖结果导出为 Excel 文件。
    *   重置: 清空中奖记录。
*   **奖项配置 (Prizes):
CRUD 操作：支持添加新奖项、修改奖项名称/数量/图标、删除奖项。
*   **内定配置 (Rigging / The "Magic")**:
    *   允许管理员为特定奖项指定必中人员。
    *   配置的人员将从普通奖池中隐形，直到被“抽取”出来。
### 5.3 音频系统
*   Spin Sound: 抽奖进行时的紧张鼓点。
*   Win Sound: 中奖时的庆典音效。
*   Mute Toggle: 全局静音开关。
## 6. 核心算法逻辑
抽奖逻辑封装在 utils/lotteryUtils.ts 的 pickWinner 函数中，优先级如下：
*   **全局去重**: 获取所有已中奖人员ID，从候选池中剔除（一个人只能中一次奖）。
*   **内定检测 (Rigged Check)**:
    *   检查当前奖项是否配置了 RiggedMap。
    *   如果有内定人员，且该人员尚未中奖、仍在候选池中，强制返回该人员。
*   **随机抽取**:
    *   如果无内定配置或内定人员已用完，执行 Math.random() 从剩余候选人中随机选取。
## 7. UI/UX 设计规范
### 7.1 配色方案
基于 Tailwind 自定义配置：
*   Background: slate-900 (深蓝灰) 至 Black 的径向渐变。
*   Neon Blue: #00ffff (主色调，用于边框、高亮、阴影)。
*   Neon Pink: #ff00ff (强调色，用于中奖信息、关键按钮)。
*   Neon Purple: #bd00ff (辅助色)。
### 7.2 字体
Display: Orbitron - 宽大的科技感无衬线字体，用于数字、奖项名称。
Body: Inter - 清晰易读，用于列表、正文。
## 8. 部署与构建 (Build & Deploy)
由于项目调整为标准的 Vite + React 结构，支持一键部署至 Vercel。
*   开发环境: npm run dev
*   生产构建: npm run build (产出 dist/ 目录)
*   静态资源: 图片与音效主要引用外部 CDN (Mixkit, Unsplash 等)，构建包体积极小。
## 9. 安全性与局限性说明
*   数据持久化: 当前版本未连接数据库或 LocalStorage。刷新页面会导致数据重置（恢复到默认 Mock 数据）。在正式使用场景下，建议操作员不要刷新页面，或后续迭代增加 LocalStorage 支持。
*   内定隐蔽性: 内定逻辑纯前端实现，若用户懂得查看浏览器 Console 或 Source Code，可能会发现内定逻辑。该功能仅供娱乐性质的活动控制使用。
