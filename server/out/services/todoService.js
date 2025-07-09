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
exports.TodoService = void 0;
const todo_1 = require("../models/todo");
class TodoService {
    constructor() {
        // 初始化TODO表
        todo_1.TodoModel.createTable();
    }
    /**
     * 创建新的TODO
     */
    createTodo(todoData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.create(todoData);
        });
    }
    /**
     * 获取用户的所有TODO
     */
    getUserTodos(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.findByUserId(userId);
        });
    }
    // /**
    //  * 根据ID获取TODO
    //  */
    getTodoById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.findById(id);
        });
    }
    /**
     * 更新TODO
     */
    updateTodo(todo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.update(todo);
        });
    }
    /**
     * 删除TODO
     */
    deleteTodo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.delete(id);
        });
    }
    /**
     * 切换TODO完成状态
     */
    toggleTodoCompleted(id, complete) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield todo_1.TodoModel.toggleCompleted(id, complete);
        });
    }
}
exports.TodoService = TodoService;
