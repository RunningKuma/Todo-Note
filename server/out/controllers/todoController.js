"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoController = void 0;
const todoService_1 = require("../services/todoService");
class TodoController {
    constructor() {
        /**
         * 获取用户的所有TODO
         */
        this.getTodos = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const todos = yield this.todoService.getUserTodos(userId);
                res.status(200).json({
                    success: true,
                    data: todos,
                    message: '获取TODO列表成功'
                });
            }
            catch (error) {
                console.error('Error getting todos:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        /**
         * 创建新的TODO
         */
        this.createTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const { title } = req.body.info;
                // @todo other check
                if (!title || title.trim() === '') {
                    res.status(400).json({ success: false, message: 'TODO标题不能为空' });
                    return;
                }
                const { info, status } = req.body;
                const todoData = {
                    user_id: userId,
                    info: Object.assign(Object.assign({}, info), { create: new Date(info.create), ddl: info.ddl ? new Date(info.ddl) : undefined }),
                    status
                };
                const response = yield this.todoService.createTodo(todoData);
                res.status(201).json({
                    success: true,
                    data: response,
                    message: 'TODO创建成功'
                });
            }
            catch (error) {
                // @ts-expect-error unknown error type
                if (error.code === 'SQLITE_CONSTRAINT') {
                    res.status(400).json({ success: false, message: 'Error：尝试创建相同 Todo' });
                    return;
                }
                console.error('Error creating todo:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 更新TODO
         */
        this.updateTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const { id } = req.body.info;
                // 验证 TODO 访问权限
                const hasAccess = yield this.validateTodoAccess(id, userId, res);
                if (!hasAccess) {
                    return;
                }
                const { info, status } = req.body;
                const todoData = {
                    user_id: userId,
                    info: Object.assign(Object.assign({}, info), { create: new Date(info.create), ddl: info.ddl ? new Date(info.ddl) : undefined }),
                    status
                };
                const response = yield this.todoService.updateTodo(todoData);
                res.status(200).json({
                    success: true,
                    data: response,
                    message: 'TODO更新成功'
                });
            }
            catch (error) {
                console.error('Error updating todo:', error);
                res.status(500).json({
                    success: false,
                    message: '更新TODO失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 删除TODO
         */
        this.deleteTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const id = req.params.id;
                // 验证 TODO 访问权限
                const hasAccess = yield this.validateTodoAccess(id, userId, res);
                if (!hasAccess) {
                    return;
                }
                yield this.todoService.deleteTodo(id);
                res.status(200).json({
                    success: true,
                    message: 'TODO删除成功'
                });
            }
            catch (error) {
                console.error('Error deleting todo:', error);
                res.status(500).json({
                    success: false,
                    message: '删除TODO失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 切换TODO完成状态
         */
        this.toggleTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const { id, complete } = req.body;
                // 验证 TODO 访问权限
                const hasAccess = yield this.validateTodoAccess(id, userId, res);
                if (!hasAccess) {
                    return;
                }
                const updatedTodo = yield this.todoService.toggleTodoCompleted(id, complete);
                res.status(200).json({
                    success: true,
                    data: updatedTodo,
                    message: 'TODO状态更新成功'
                });
            }
            catch (error) {
                console.error('Error toggling todo:', error);
                res.status(500).json({
                    success: false,
                    message: '更新TODO状态失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.todoService = new todoService_1.TodoService();
    }
    /**
     * 验证 Todo 修改权限
     */
    validateTodoAccess(todoId, userId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!todoId) {
                res.status(400).json({ success: false, message: '无效的TODO ID' });
                return false;
            }
            // 检查TODO是否存在且属于当前用户
            const existingTodo = yield this.todoService.getTodoById(todoId);
            if (!existingTodo) {
                res.status(404).json({ success: false, message: 'TODO不存在' });
                return false;
            }
            if (existingTodo.user_id !== userId) {
                res.status(403).json({ success: false, message: '无权限访问此TODO' });
                return false;
            }
            return true;
        });
    }
}
exports.TodoController = TodoController;
