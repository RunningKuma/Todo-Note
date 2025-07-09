"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = require("../controllers/noteController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const noteController = new noteController_1.NoteController();
// 应用认证中间件到所有笔记路由
router.use(auth_1.authenticateToken);
// 笔记 API 路由
router.get('/folders', noteController.getFolders); // 1. 获取用户笔记目录结构
router.post('/folders', noteController.updateFolders); // 2. 更新用户笔记目录结构
router.get('/:id', noteController.getNote); // 3. 根据ID获取笔记
router.post('/', noteController.createNote); // 4. 创建新笔记
router.put('/', noteController.updateNote); // 5. 更新笔记
router.delete('/:id', noteController.deleteNote); // 6. 删除笔记
// 保留的方法（暂时不可用）
router.post('/folder', noteController.createNoteFolder); // 创建笔记文件夹
exports.default = router;
