# Todo-Note App

一个功能丰富的桌面应用程序，集成了待办事项管理和笔记功能，使用 Vue 3 + Tauri + Express 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.x-green.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.x-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

## ✨ 特性

### 📝 笔记管理

- **富文本编辑器**：基于 Vditor 的 Markdown 编辑器
- **版本控制**：自动保存笔记版本，支持版本比较和回滚
- **树形结构**：文件夹和笔记的层级管理
- **标签系统**：支持多标签分类和筛选
- **搜索功能**：全文搜索笔记内容
- **收藏功能**：重要笔记收藏管理

### ✅ 待办事项

- **任务管理**：创建、编辑、删除待办事项
- **状态追踪**：未开始、进行中、已完成状态管理
- **优先级设置**：高、中、低优先级分类
- **截止日期**：设置任务截止时间和提醒
- **标签分类**：使用标签组织任务
- **筛选排序**：多条件筛选和排序

### 🔒 用户认证

- **JWT 认证**：安全的用户登录注册
- **密码加密**：BCrypt 密码哈希存储
- **用户会话**：持久化登录状态

### 💾 数据存储

- **本地数据库**：SQLite 数据持久化
- **客户端缓存**：IndexedDB 版本管理
- **数据同步**：前后端数据同步

## 🛠️ 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Tauri** - 跨平台桌面应用框架
- **PrimeVue** - UI 组件库
- **TailwindCSS** - 原子化 CSS 框架
- **Vditor** - Markdown 编辑器
- **Vue Router** - 路由管理

### 后端

- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **SQLite** - 轻量级数据库
- **JWT** - JSON Web Tokens
- **BCrypt** - 密码加密

### 开发工具

- **Vite** - 快速构建工具
- **ESLint** - 代码检查工具
- **Prettier** - 代码格式化
- **PNPM** - 包管理器

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PNPM 9+
- Rust (用于 Tauri)

### 安装依赖

```bash
# 安装根目录依赖
pnpm i

# 安装服务端依赖
cd server
pnpm i
cd ..
```

### 开发模式

```bash
# 启动前端 + 后端开发服务器
pnpm run dev

# 或者分别启动
pnpm run dev:client  # 前端开发服务器
pnpm run dev:server  # 后端开发服务器
```

### 构建应用

```bash
# 构建前端
pnpm run build

# 构建 Tauri 应用
pnpm run tauri build
```

## 📁 项目结构

```text
Todo-Note/
├── src/                              # 前端源码
│   ├── components/                   # 公共组件
│   │   ├── PageHeader.vue           # 页面头部组件，包含标题、操作按钮
│   │   └── Time.vue                 # 时间显示组件
│   ├── screens/                     # 页面组件
│   │   ├── Home/                    # 主应用页面
│   │   │   ├── HomeView.vue        # 主页面容器
│   │   │   ├── Note/               # 笔记功能模块
│   │   │   │   ├── NoteView.vue    # 笔记主界面
│   │   │   │   └── components/     # 笔记相关组件
│   │   │   │       ├── NoteTree.vue     # 笔记树形导航
│   │   │   │       ├── NoteMeta.vue     # 笔记元数据显示
│   │   │   │       └── InplaceEdit.vue  # 内联编辑组件，参考：https://primevue.org/inplace/
│   │   │   ├── Todo/               # 待办事项功能模块
│   │   │   │   ├── TodoView.vue    # 待办事项主界面
│   │   │   │   └── components/     # 待办相关组件
│   │   │   │       ├── TodoItem.vue     # 单个待办项组件
│   │   │   │       └── TodoDialog.vue   # 待办编辑对话框
│   │   │   ├── SideBar/            # 侧边栏模块
│   │   │   │   └── DrawerTrigger.vue # 侧边栏切换按钮
│   │   │   ├── Overview/           # 概览页面(原主页)
│   │   └── Login/                  # 登录注册页面
│   │       ├── LoginView.vue       # 登录主界面
│   │       ├── LoginCard.vue       # 登录卡片(邮箱密码)
│   │       ├── RegisterCard.vue    # 注册卡片
│   │       ├── InitialCard.vue     # 初始化卡片(输入邮箱)
│   │       └── RegisterDoneCard.vue # 注册完成卡片
│   ├── api/                        # API 接口层，用于包装前端相关请求
│   │   ├── auth/                   # 认证相关 API
│   │   │   ├── auth.ts            # 用户认证接口
│   │   │   └── cookie.ts          # Cookie 管理
│   │   ├── note/                   # 笔记相关 API
│   │   │   └── note.ts            # 笔记 CRUD 和版本管理
│   │   ├── todo/                   # 待办事项相关 API
│   │   │   └── todo.ts            # 待办事项 CRUD
│   │   ├── types/                  # TypeScript 类型定义
│   │   │   ├── user.d.ts          # 用户类型
│   │   │   ├── note.d.ts          # 笔记类型
│   │   │   ├── todo.d.ts          # 待办事项类型
│   │   │   └── gerneral.d.ts      # 通用类型
│   │   ├── utils/                  # 工具函数
│   │   │   ├── request.ts         # HTTP 请求封装
│   │   │   ├── indexedDB.ts       # IndexedDB 操作
│   │   │   ├── note.ts            # 笔记工具函数
│   │   │   ├── todo.ts            # 待办事项工具函数
│   │   │   ├── time.ts            # 时间处理
│   │   │   ├── toast.ts           # PrimeVue toast 封装
│   │   │   └── perform.ts         # 性能优化工具
│   │   └── constants/              # 常量定义
│   │       └── test.ts            # 前端测试用数据
│   ├── router/                     # 路由配置
│   │   └── index.ts               # Vue Router 配置
│   ├── styles/                     # 样式文件
│   │   └── global.css             # 全局样式
│   ├── App.vue                     # 根组件
│   ├── main.ts                     # 应用入口
│   └── vite-env.d.ts              # Vite 环境类型
├── server/                         # 后端源码
│   ├── src/
│   │   ├── controllers/            # 控制器层
│   │   │   ├── authController.ts   # 用户认证控制器
│   │   │   ├── noteController.ts   # 笔记管理控制器
│   │   │   ├── todoController.ts   # 待办事项控制器
│   │   │   └── userController.ts   # 用户管理控制器
│   │   ├── models/                 # 数据模型层
│   │   │   ├── user.ts            # 用户数据模型
│   │   │   ├── note.ts            # 笔记数据模型
│   │   │   └── todo.ts            # 待办事项数据模型
│   │   ├── routes/                 # 路由定义
│   │   │   ├── auth.ts            # 认证路由
│   │   │   ├── note.ts            # 笔记路由
│   │   │   ├── todo.ts            # 待办事项路由
│   │   │   └── user.ts            # 用户路由
│   │   ├── middleware/             # 中间件
│   │   │   └── auth.ts            # JWT 认证中间件
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── userService.ts     # 用户业务逻辑
│   │   │   └── todoService.ts     # 待办事项业务逻辑
│   │   ├── types/                  # 后端类型定义
│   │   │   ├── user.d.ts          # 用户类型
│   │   │   ├── note.d.ts          # 笔记类型
│   │   │   ├── todo.d.ts          # 待办事项类型
│   │   │   ├── request.d.ts       # 请求类型
│   │   │   └── db.d.ts            # 数据库类型
│   │   ├── utils/                  # 工具函数
│   │   │   ├── db.ts              # 数据库连接工具
│   │   │   ├── jwt.ts             # JWT 工具
│   │   │   └── password.ts        # 密码加密工具
│   │   ├── config/                 # 配置文件
│   │   │   └── database.ts        # 数据库配置
│   │   ├── app.ts                  # Express 应用配置
│   │   └── index.ts               # 服务器入口
│   ├── database/                   # 数据库文件
│   │   └── database.sqlite        # SQLite 数据库
│   ├── package.json               # 后端依赖配置
│   ├── tsconfig.json              # TypeScript 配置
│   └── README.md                  # 后端说明文档
├── src-tauri/                     # Tauri 桌面应用配置
│   ├── src/
│   │   ├── main.rs               # Rust 主程序
│   │   └── lib.rs                # Rust 库文件
│   ├── icons/                    # 应用图标
│   ├── capabilities/             # Tauri 权限配置
│   │   └── default.json         # 默认权限
│   ├── Cargo.toml               # Rust 依赖配置
│   ├── tauri.conf.json          # Tauri 应用配置
│   └── build.rs                 # 构建脚本
├── docs/                        # 项目文档
│   ├── AI-Gen/                  # AI 生成的文档
│   │   ├── auth-best-practices.md      # 认证最佳实践
│   │   ├── note-version-indexeddb.md   # 笔记版本管理指南
│   │   └── vditor-diff-guide.md        # Vditor 差异比较指南
│   └── server/                  # 服务器相关文档
│       ├── general.md           # 服务器通用说明
│       └── note.md              # 笔记功能说明
├── package.json                 # 前端依赖配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 构建配置
├── eslint.config.js            # ESLint 代码检查配置
├── index.html                  # HTML 入口文件
├── pnpm-lock.yaml             # PNPM 锁定文件
└── README.md                   # 项目说明文档
```

## 🔧 配置

### 数据库配置

应用使用 SQLite 数据库，数据库文件位于 `server/database/database.sqlite`。首次运行时会自动创建数据库表。

### 环境变量

在 `server` 目录下创建 `.env` 文件：

```env
PORT=3000             # 服务器运行的端口
JWT_SECRET=jwt_secret # JSON Web Token 加密私钥
```

## 📖 API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 待办事项接口

- `GET /api/todos` - 获取所有待办事项
- `POST /api/todos` - 创建待办事项
- `PUT /api/todos` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项
- `PATCH /api/todos/toggle` - 切换 todo 完成状态 @todo 应该使用 :id ()

### 笔记接口

- `GET /api/notes` - 获取所有笔记
- `POST /api/notes` - 创建笔记
- `GET /api/notes/:id` - 获取单个笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `GET /api/notes/folders` - 获取笔记目录结构数据，类型定义见 [note.d.ts](src\api\types\note.d.ts)

## 🎨 功能截图

### 笔记编辑器

- Markdown 实时预览
- 版本管理和比较
- 文件夹树形结构

### 待办事项管理

- 任务状态管理
- 优先级设置
- 筛选和排序

### 用户界面

- 现代化 UI 设计
- 响应式布局
- 深色/浅色主题

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [Vue.js](https://vuejs.org/)
- [Tauri](https://tauri.app/)
- [PrimeVue](https://primevue.org/)
- [Vditor](https://github.com/Vanessa219/vditor)

## 🙏 致谢

感谢所有开源项目的贡献者，让这个项目成为可能。

---

如果你觉得这个项目有用，请给它一个 ⭐️！
