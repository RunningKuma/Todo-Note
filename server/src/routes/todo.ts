import { Router } from 'express';
import { TodoController } from '../controllers/todoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const todoController = new TodoController();

// 应用认证中间件到所有TODO路由
router.use(authenticateToken);

// TODO CRUD 操作
router.get('/', todoController.getTodos);              // 获取所有TODO
router.post('/', todoController.createTodo);           // 创建新TODO
router.put('/', todoController.updateTodo);         // 更新TODO
router.delete('/:id', todoController.deleteTodo);      // 删除TODO

// TODO 状态操作
router.patch('/:id/toggle', todoController.toggleTodo); // 切换完成状态

// TODO 过滤操作
router.get('/completed', todoController.getCompletedTodos);  // 获取已完成的TODO
router.get('/pending', todoController.getPendingTodos);     // 获取未完成的TODO
router.get('/category/:category', todoController.getTodosByCategory); // 按分类获取TODO

export default router;
