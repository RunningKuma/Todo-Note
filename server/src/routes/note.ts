import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const noteController = new NoteController();

// 应用认证中间件到所有笔记路由
router.use(authenticateToken);

// 笔记 API 路由
router.get('/folders', noteController.getFolders);          // 1. 获取用户笔记目录结构
router.post('/folders', noteController.updateFolders);      // 2. 更新用户笔记目录结构
router.get('/:id', noteController.getNote);                // 3. 根据ID获取笔记
router.post('/', noteController.createNote);               // 4. 创建新笔记
router.put('/', noteController.updateNote);                // 5. 更新笔记
router.delete('/:id', noteController.deleteNote);          // 6. 删除笔记

// 保留的方法（暂时不可用）
router.post('/folder', noteController.createNoteFolder);   // 创建笔记文件夹

export default router;
