// test/services/noteService.test.ts

import { NoteService } from '@server/services/noteService';
import { UserService } from '@server/services/userService';
import { Note, NoteTreeNode, NoteMeta } from '@server/types/note';
import { randomUUID } from 'crypto';

describe('NoteService', () => {
  let noteService: NoteService;
  let userService: UserService;
  let userId: string;

  // 测试前准备工作：创建一个用户
  beforeEach(async () => {
    userService = new UserService();
    noteService = new NoteService();

    // 创建测试用户
    const user = await userService.createUser(
      'note-test@example.com',
      'note-test-user',
      'password123'
    );
    userId = user!.id;
  });

  // 创建笔记的测试数据
  const createTestNoteMetaWithDates = (): NoteMeta => ({
    id: randomUUID(),
    title: '测试笔记',
    tags: ['测试', '示例'],
    create: new Date(),
    modified: new Date()
  });

  // 基本初始化测试
  describe('初始化', () => {
    it('应该能够正确初始化NoteService', () => {
      expect(noteService).toBeInstanceOf(NoteService);
    });
  });

  describe('createNote', () => {
    it('应该创建一个新的笔记', async () => {
      const noteMeta = createTestNoteMetaWithDates();
      
      // 创建笔记
      const result = await noteService.createNote(userId, noteMeta);
      
      // 断言
      expect(result).toBe(true);
      
      // 获取笔记验证创建成功
      const note = await noteService.getNoteById(noteMeta.id);
      expect(note).not.toBeNull();
      expect(note!.meta.id).toBe(noteMeta.id);
      expect(note!.meta.title).toBe(noteMeta.title);
      expect(note!.content).toBe(''); // 初始内容为空
    });
  });

  describe('getNoteById', () => {
    it('应该通过ID获取笔记', async () => {
      // 创建一个笔记
      const noteMeta = createTestNoteMetaWithDates();
      await noteService.createNote(userId, noteMeta);
      
      // 获取笔记
      const note = await noteService.getNoteById(noteMeta.id);
      
      // 断言
      expect(note).not.toBeNull();
      expect(note!.meta.id).toBe(noteMeta.id);
      expect(note!.meta.title).toBe(noteMeta.title);
      expect(Array.isArray(note!.meta.tags)).toBe(true);
      expect(note!.meta.tags).toEqual(expect.arrayContaining(['测试', '示例']));
    });
    
    it('当笔记不存在时应返回null', async () => {
      const result = await noteService.getNoteById('non-existent-id');
      expect(result).toBeNull();
    });
  });
  
  describe('updateNote', () => {
    it('应该更新笔记', async () => {
      // 创建一个笔记
      const noteMeta = createTestNoteMetaWithDates();
      await noteService.createNote(userId, noteMeta);
      
      // 获取创建的笔记
      const createdNote = await noteService.getNoteById(noteMeta.id);
      expect(createdNote).not.toBeNull();
      
      // 更新笔记
      const updatedNote: Note = {
        meta: {
          ...createdNote!.meta,
          title: '更新后的标题',
          tags: ['更新', '示例'],
          modified: new Date()
        },
        content: '这是更新后的内容'
      };
      
      const updateResult = await noteService.updateNote(updatedNote);
      expect(updateResult).toBe(true);
      
      // 获取更新后的笔记
      const retrievedNote = await noteService.getNoteById(noteMeta.id);
      
      // 断言
      expect(retrievedNote).not.toBeNull();
      expect(retrievedNote!.meta.title).toBe('更新后的标题');
      expect(retrievedNote!.content).toBe('这是更新后的内容');
      expect(retrievedNote!.meta.tags).toEqual(expect.arrayContaining(['更新', '示例']));
    });
  });
  
  describe('deleteNote', () => {
    it('应该删除笔记', async () => {
      // 创建一个笔记
      const noteMeta = createTestNoteMetaWithDates();
      await noteService.createNote(userId, noteMeta);
      
      // 删除笔记
      const deleteResult = await noteService.deleteNote(noteMeta.id);
      expect(deleteResult).toBe(true);
      
      // 尝试获取已删除的笔记
      const deletedNote = await noteService.getNoteById(noteMeta.id);
      
      // 断言
      expect(deletedNote).toBeNull();
    });
  });
  
  describe('getRecentNotes', () => {
    it('应该获取用户的最近笔记', async () => {
      // 创建3个笔记
      for (let i = 0; i < 3; i++) {
        const noteMeta: NoteMeta = {
          id: randomUUID(),
          title: `笔记${i+1}`,
          tags: [`标签${i+1}`],
          create: new Date(),
          modified: new Date()
        };
        await noteService.createNote(userId, noteMeta);
      }
      
      // 获取用户的最近笔记（默认限制10个）
      const notes = await noteService.getRecentNotes(userId);
      
      // 断言
      expect(notes).toBeTruthy();
      expect(notes.length).toBe(3);
      
      // 获取用户的最近笔记（限制2个）
      const limitedNotes = await noteService.getRecentNotes(userId, 2);
      
      // 断言
      expect(limitedNotes).toBeTruthy();
      expect(limitedNotes.length).toBe(2);
    });
    
    it('应该返回空数组当用户没有笔记时', async () => {
      // 使用一个不存在的用户ID
      const nonExistentUserId = 'non-existent-user-id';
      
      // 获取用户的所有笔记
      const notes = await noteService.getRecentNotes(nonExistentUserId);
      
      // 断言
      expect(notes).toBeTruthy();
      expect(notes.length).toBe(0);
    });
  });
  
  describe('getFolders', () => {
    it('应该获取用户的笔记目录结构', async () => {
      // 初始状态应该是空数组
      const initialFolders = await noteService.getFolders(userId);
      expect(initialFolders).toBeInstanceOf(Array);
      expect(initialFolders.length).toBe(0);
    });
  });
  
  describe('updateFolders', () => {
    it('应该更新用户的笔记目录结构', async () => {
      // 创建测试目录结构
      const testFolders: NoteTreeNode[] = [
        {
          key: 'folder1',
          label: '文件夹1',
          type: 'folder',
          selectable: false,
          children: [
            {
              key: randomUUID(),
              label: '笔记1',
              type: 'note',
              selectable: true
            }
          ]
        },
        {
          key: 'folder2',
          label: '文件夹2',
          type: 'folder',
          selectable: false
        }
      ];
      
      // 更新目录结构
      const updateResult = await noteService.updateFolders(userId, testFolders);
      expect(updateResult).toBe(true);
      
      // 获取更新后的目录结构
      const updatedFolders = await noteService.getFolders(userId);
      
      // 断言
      expect(updatedFolders).toBeInstanceOf(Array);
      expect(updatedFolders.length).toBe(2);
      expect(updatedFolders[0].label).toBe('文件夹1');
      expect(updatedFolders[1].label).toBe('文件夹2');
      expect(updatedFolders[0].children).toBeDefined();
      expect(updatedFolders[0].children!.length).toBe(1);
    });
  });
});
