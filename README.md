# Space Voyager English

太空探索主题的英语学习应用，通过交互式太阳系地图将英语学习融入太空探索之旅。

## 功能特色

- **交互式星图导航**：通过太阳系星图浏览不同的学习单元
- **词汇探索**：分类学习词汇，支持记忆跟踪
- **任务挑战**：完成各种英语学习任务，提升学习动力
- **成就系统**：记录学习成果，展示学习进度

## 技术栈

- Vue 3 + Composition API
- Pinia 状态管理
- Vue Router
- GSAP 动画库
- Howler.js 音效处理

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
```

### 构建项目

```bash
npm run build
# 或
pnpm build
```

## 项目结构

- `src/views/` - 主要视图组件
  - `StarMap.vue` - 交互式太阳系星图
  - `WordExplorer.vue` - 词汇学习界面
  - `MissionCenter.vue` - 任务中心
  - `AchievementCenter.vue` - 成就中心
- `src/components/` - 可复用组件
- `src/stores/` - Pinia 状态管理
- `src/assets/` - 静态资源文件
