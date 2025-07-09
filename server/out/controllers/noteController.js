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
exports.NoteController = void 0;
const note_1 = require("../models/note");
const noteService_1 = require("../services/noteService");
class NoteController {
    constructor() {
        /**
         * 1. 获取用户笔记目录结构
         * GET /folders
         */
        this.getFolders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const folders = yield note_1.NoteClass.getFolders(userId);
                res.status(200).json({
                    success: true,
                    data: folders
                });
            }
            catch (error) {
                console.error('Error getting folders:', error);
                res.status(500).json({
                    success: false,
                    message: '获取笔记目录结构失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 2. 更新用户笔记目录结构
         * POST /folders
         */
        this.updateFolders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const { data } = req.body;
                if (!data) {
                    res.status(400).json({ success: false, message: '请提供笔记目录结构数据' });
                    return;
                }
                const success = yield note_1.NoteClass.updateFolders(userId, data);
                res.status(200).json({
                    success
                });
            }
            catch (error) {
                console.error('Error updating folders:', error);
                res.status(500).json({
                    success: false,
                    message: '更新笔记目录结构失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 3. 根据ID获取笔记
         * GET /:id
         */
        this.getNote = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const noteId = req.params.id;
                if (!noteId) {
                    res.status(400).json({ success: false, message: '笔记ID不能为空' });
                    return;
                }
                const note = yield note_1.NoteClass.findById(noteId);
                if (!note) {
                    res.status(404).json({ success: false, message: '笔记不存在' });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: note
                });
            }
            catch (error) {
                console.error('Error getting note:', error);
                res.status(500).json({
                    success: false,
                    message: '获取笔记失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 4. 创建新笔记
         * POST /
         */
        this.createNote = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const noteMeta = req.body;
                if (!noteMeta.title || noteMeta.title.trim() === '') {
                    res.status(400).json({ success: false, message: '笔记标题不能为空' });
                    return;
                }
                const success = yield note_1.NoteClass.create(userId, noteMeta);
                res.status(201).json({
                    success
                });
            }
            catch (error) {
                console.error('Error creating note:', error);
                res.status(500).json({
                    success: false,
                    message: '创建笔记失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 5. 更新笔记
         * PUT /
         */
        this.updateNote = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const note = req.body;
                if (!note || !note.meta || !note.meta.id) {
                    res.status(400).json({ success: false, message: '请提供完整的笔记数据' });
                    return;
                }
                // 验证笔记是否存在
                const existingNote = yield note_1.NoteClass.findById(note.meta.id);
                if (!existingNote) {
                    res.status(404).json({ success: false, message: '笔记不存在' });
                    return;
                }
                const success = yield note_1.NoteClass.update(note);
                res.status(200).json({
                    success
                });
            }
            catch (error) {
                console.error('Error updating note:', error);
                res.status(500).json({
                    success: false,
                    message: '更新笔记失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 6. 删除笔记
         * DELETE /:id
         */
        this.deleteNote = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const noteId = req.params.id;
                if (!noteId) {
                    res.status(400).json({ success: false, message: '笔记ID不能为空' });
                    return;
                }
                // 验证笔记是否存在
                const existingNote = yield note_1.NoteClass.findById(noteId);
                if (!existingNote) {
                    res.status(404).json({ success: false, message: '笔记不存在' });
                    return;
                }
                const success = yield note_1.NoteClass.delete(noteId);
                res.status(200).json({
                    success
                });
            }
            catch (error) {
                console.error('Error deleting note:', error);
                res.status(500).json({
                    success: false,
                    message: '删除笔记失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        /**
         * 创建笔记文件夹 (保留此方法以备后用)
         */
        this.createNoteFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未授权访问' });
                    return;
                }
                const { name } = req.body;
                if (!name || name.trim() === '') {
                    res.status(400).json({ success: false, message: '文件夹名称不能为空' });
                    return;
                }
                // 这里可以添加创建文件夹的逻辑
                // 由于现在使用树形结构存储在用户表中，这个方法可能需要重新设计
                res.status(501).json({
                    success: false,
                    message: '此功能暂时不可用，请使用目录结构更新接口'
                });
            }
            catch (error) {
                console.error('Error creating note folder:', error);
                res.status(500).json({
                    success: false,
                    message: '创建笔记文件夹失败',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.noteService = new noteService_1.NoteService();
    }
}
exports.NoteController = NoteController;
