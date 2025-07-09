import type { NoteVersion } from '../note/diffEngine';

export interface DBNote {
  id: string;
  versions: NoteVersion[];
  lastModified: number;
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'TodoNoteDB';
  private readonly dbVersion = 1;
  private readonly storeNames = {
    notes: 'notes',
    versions: 'versions'
  };

  /**
   * 初始化数据库连接
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建笔记存储
        if (!db.objectStoreNames.contains(this.storeNames.notes)) {
          const notesStore = db.createObjectStore(this.storeNames.notes, { keyPath: 'id' });
          notesStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // 创建版本存储
        if (!db.objectStoreNames.contains(this.storeNames.versions)) {
          const versionsStore = db.createObjectStore(this.storeNames.versions, { keyPath: 'id' });
          versionsStore.createIndex('noteId', 'noteId', { unique: false });
          versionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 确保数据库已初始化
   */
  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * 保存笔记的所有版本
   */
  async saveNoteVersions(noteId: string, versions: NoteVersion[]): Promise<void> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeNames.notes], 'readwrite');
      const store = transaction.objectStore(this.storeNames.notes);

      const noteData: DBNote = {
        id: noteId,
        versions,
        lastModified: Date.now()
      };

      const request = store.put(noteData);

      request.onerror = () => {
        reject(new Error('Failed to save note versions'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * 获取笔记的所有版本
   */
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeNames.notes], 'readonly');
      const store = transaction.objectStore(this.storeNames.notes);
      const request = store.get(noteId);

      request.onerror = () => {
        reject(new Error('Failed to get note versions'));
      };

      request.onsuccess = () => {
        const result = request.result as DBNote | undefined;
        resolve(result?.versions || []);
      };
    });
  }

  /**
   * 添加单个版本到笔记
   */
  async addVersionToNote(noteId: string, version: NoteVersion): Promise<void> {
    const existingVersions = await this.getNoteVersions(noteId);
    existingVersions.push(version);

    // 限制版本数量，只保留最近的 50 个版本
    if (existingVersions.length > 50) {
      existingVersions.splice(0, existingVersions.length - 50);
    }

    await this.saveNoteVersions(noteId, existingVersions);
  }

  /**
   * 删除笔记的所有版本
   */
  async deleteNoteVersions(noteId: string): Promise<void> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeNames.notes], 'readwrite');
      const store = transaction.objectStore(this.storeNames.notes);
      const request = store.delete(noteId);

      request.onerror = () => {
        reject(new Error('Failed to delete note versions'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * 获取所有笔记的基本信息
   */
  async getAllNotesInfo(): Promise<Array<{ id: string; lastModified: number; versionCount: number }>> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeNames.notes], 'readonly');
      const store = transaction.objectStore(this.storeNames.notes);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('Failed to get notes info'));
      };

      request.onsuccess = () => {
        const results = request.result as DBNote[];
        const notesInfo = results.map(note => ({
          id: note.id,
          lastModified: note.lastModified,
          versionCount: note.versions.length
        }));
        resolve(notesInfo);
      };
    });
  }

  /**
   * 清理过期数据
   */
  async cleanupOldData(daysToKeep = 30): Promise<void> {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeNames.notes], 'readwrite');
      const store = transaction.objectStore(this.storeNames.notes);
      const index = store.index('lastModified');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onerror = () => {
        reject(new Error('Failed to cleanup old data'));
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * 获取数据库存储使用情况
   */
  async getStorageInfo(): Promise<{ estimatedUsage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        estimatedUsage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { estimatedUsage: 0, quota: 0 };
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 导出单例实例
export const indexedDBManager = new IndexedDBManager();
