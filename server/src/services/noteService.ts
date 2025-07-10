import { NoteClass } from '../models/note';
import { Note, NoteTreeNode, NoteMeta } from '@server/types/note';
import { UserId } from '@server/types/gerneral';


export class NoteService {
  constructor() {
    NoteClass.createTable();
  }

  async getFolders(userId: UserId): Promise<NoteTreeNode[]> {
    return await NoteClass.getFolders(userId);
  }

  async updateFolders(userId: UserId, folders: NoteTreeNode[]): Promise<boolean> {
    return await NoteClass.updateFolders(userId, folders);
  }

  async getNoteById(noteId: string): Promise<Note | null> {
    return await NoteClass.findById(noteId);
  }

  async createNote(userId: UserId, Meta: NoteMeta): Promise<boolean> {
    return await NoteClass.create(userId, Meta);
  }
  async updateNote(note: Note): Promise<boolean> {
    return await NoteClass.update(note);
  }
  
  async deleteNote(noteId: string): Promise<boolean> {
    return await NoteClass.delete(noteId);
  }

  /**
   * 获取用户最近的笔记
   */
  async getRecentNotes(userId: UserId, limit: number = 10): Promise<Note[]> {
    return await NoteClass.findRecentByUserId(userId, limit);
  }
}
