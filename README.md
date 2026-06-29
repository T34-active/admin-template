# 管理后台模板

基于 Vue 3 + TypeScript + Vite 构建的中后台管理系统前端模板，开箱即用，适合作为企业级管理后台项目的起始脚手架。

## 技术栈

- [Vue 3](https://vuejs.org/) — 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [Vite](https://vitejs.dev/) — 下一代前端构建工具
- [Element Plus](https://element-plus.org/) — UI 组件库
- [Pinia](https://pinia.vuejs.org/) — 状态管理
- [Vue Router](https://router.vuejs.org/) — 路由管理
- [UnoCSS](https://unocss.dev/) — 原子化 CSS
- [Axios](https://axios-http.com/) — HTTP 请求
- [ECharts](https://echarts.apache.org/) — 数据可视化

## 功能特性

- 登录 / 登出、Token 鉴权、动态路由与权限控制
- 侧边栏菜单、面包屑、TagsView 多页签
- 布局配置（主题、Logo、固定头部等）
- 系统管理：用户、角色、菜单、部门、岗位、字典、参数、通知公告
- 系统监控：在线用户、定时任务、操作日志、登录日志、服务监控、缓存监控
- 开发工具：代码生成、表单构建、接口文档
- 常用组件：富文本编辑器、文件上传、图片裁剪、字典标签、分页、树形选择等

## 环境要求

- Node.js >= 18
- pnpm（推荐）

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:8080）
pnpm dev

# 构建生产环境
pnpm build:prod

# 构建预发布环境
pnpm build:stage

# 预览生产构建
pnpm preview
```

## 环境变量

项目通过 `.env.*` 文件管理环境配置，主要变量如下：

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_TITLE` | 页面标题 |
| `VITE_APP_ENV` | 运行环境（development / production / staging） |
| `VITE_APP_BASE_URL` | 接口请求前缀 |
| `VITE_SERVER_BASEURL` | 开发环境代理目标地址 |
| `VITE_BUILD_COMPRESS` | 生产构建压缩方式（gzip / brotli） |

开发环境请在 `.env.development` 中配置 `VITE_SERVER_BASEURL` 指向后端服务地址。

## 目录结构

```
├── public/              # 静态资源
├── src/
│   ├── api/             # 接口定义
│   ├── assets/          # 样式、图标、图片
│   ├── components/      # 公共组件
│   ├── directive/       # 自定义指令（权限等）
│   ├── layout/          # 布局组件
│   ├── plugins/         # 插件封装
│   ├── router/          # 路由配置
│   ├── store/           # Pinia 状态
│   ├── utils/           # 工具函数
│   └── views/           # 页面视图
├── vite/                # Vite 插件配置
└── vite.config.ts       # Vite 配置
```

## 代码规范

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix
```

## 说明

本模板为前端工程，需配合后端 API 使用。默认接口风格参考若依（RuoYi）体系，接入自有后端时请按需调整 `src/api` 与权限路由逻辑。
