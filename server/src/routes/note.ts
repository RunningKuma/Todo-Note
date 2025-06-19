import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const noteController = new NoteController();

// 应用认证中间件到所有笔记路由
router.use(authenticateToken);

// 笔记 CRUD 操作
router.get('/', noteController.getNotes);              // 获取所有笔记
router.post('/', noteController.createNote);           // 创建新笔记
router.get('/:id', noteController.getNote);            // 获取单个笔记
router.put('/:id', noteController.updateNote);         // 更新笔记
router.delete('/:id', noteController.deleteNote);      // 删除笔记

// 笔记特殊操作
router.patch('/:id/favorite', noteController.toggleFavorite); // 切换收藏状态

// 笔记过滤和搜索
router.get('/search', noteController.searchNotes);            // 搜索笔记
router.get('/favorites', noteController.getFavoriteNotes);    // 获取收藏的笔记
router.get('/category/:category', noteController.getNotesByCategory); // 按分类获取笔记
router.get('/tag/:tag', noteController.getNotesByTag);        // 按标签获取笔记

// 元数据获取
router.get('/meta/categories', noteController.getCategories); // 获取所有分类
router.get('/meta/tags', noteController.getTags);             // 获取所有标签

export default router;
