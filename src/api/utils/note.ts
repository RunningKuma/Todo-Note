import { Note, NoteMeta, NoteTreeType } from "../types/note";

// 工具函数
export const noteUtils = {
  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN');
  },

  /**
   * 计算文本相似度
   */
  calculateSimilarity(text1: string, text2: string): number {
    const diffs = diff(text1, text2);
    const totalLength = Math.max(text1.length, text2.length);
    let equalLength = 0;

    diffs.forEach(([type, text]) => {
      if (type === diff.EQUAL) {
        equalLength += text.length;
      }
    });

    return totalLength === 0 ? 1 : equalLength / totalLength;
  },

  /**
   * 统计差异信息
   */
  getDiffStats(diffs: NoteDiff[]): {
    additions: number;
    deletions: number;
    changes: number;
  } {
    let additions = 0;
    let deletions = 0;
    let changes = 0;

    diffs.forEach(diff => {
      switch (diff.type) {
        case 'insert':
          additions += diff.text.length;
          changes++;
          break;
        case 'delete':
          deletions += diff.text.length;
          changes++;
          break;
      }
    });

    return { additions, deletions, changes };
  }
};
export function createEmptyNoteMeta(type: NoteTreeType = 'note'): NoteMeta {
  return {
    id: window.crypto.randomUUID(),
    title: '新建' + (type === 'folder' ? '文件夹' : '笔记'),
    create: new Date(),
    modified: new Date(),
    tags: [],
  };
}