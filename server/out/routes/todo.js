"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const todoController = new todoController_1.TodoController();
// 应用认证中间件到所有TODO路由
router.use(auth_1.authenticateToken);
// TODO CRUD 操作
router.get('/', todoController.getTodos); // 获取所有TODO
router.post('/', todoController.createTodo); // 创建新TODO
router.put('/', todoController.updateTodo); // 更新TODO
router.delete('/:id', todoController.deleteTodo); // 删除TODO
// TODO 状态操作
router.patch('/toggle', todoController.toggleTodo); // 切换完成状态
// TODO 过滤操作
// router.get('/completed', todoController.getCompletedTodos);  // 获取已完成的TODO
// router.get('/pending', todoController.getPendingTodos);     // 获取未完成的TODO
// router.get('/category/:category', todoController.getTodosByCategory); // 按分类获取TODO
exports.default = router;
