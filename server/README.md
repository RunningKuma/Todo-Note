# SQLite Authentication Server

这是一个使用 SQLite 的后端服务器，提供用户注册和登录功能。

## 项目结构

- `src/` - 源代码目录
  - `config/` - 数据库配置
  - `controllers/` - 控制器，处理请求和响应
  - `middleware/` - 中间件，处理身份验证
  - `models/` - 数据模型
  - `routes/` - 路由定义
  - `services/` - 服务层，包含业务逻辑
  - `utils/` - 工具函数
  - `types/` - TypeScript 类型定义
  - `app.ts` - 应用程序入口
  - `index.ts` - 启动服务器
- `database/` - SQLite 数据库文件
- `package.json` - 项目依赖和脚本
- `tsconfig.json` - TypeScript 配置文件

## 安装

使用以下命令安装依赖：

```
pnpm install
```

## 启动服务器

使用以下命令启动服务器：

```
pnpm dev
```
