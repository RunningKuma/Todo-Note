import Vditor from 'vditor';
import diff from 'fast-diff';
import { throttle } from '../utils/perform';

export interface NoteDiff {
  type: 'equal' | 'delete' | 'insert';
  text: string;
}

export interface NoteVersion {
  id: string;
  content?: string; // 完整内容（仅用于第一个版本）
  diffs?: NoteDiff[]; // 相对于前一版本的差异
  timestamp: number;
  author?: string;
  baseVersionId?: string; // 基础版本ID
}
export interface NoteVersionRaw {
  id: string;
  content: string;
  timestamp: number;
  author?: string;
}

export class NoteDiffEngine {
  private vditor?: Vditor;
  private noteId?: string;
  private versions: Map<string, NoteVersion[]> = new Map();
  private autoSaveEnabled = true;
  private autoSaveDelay = 2000; // 2秒自动保存

  /**
   * 初始化 Vditor 编辑器
   */
  async initVditor(element: HTMLElement, options?: IOptions): Promise<Vditor> {
    this.vditor = new Vditor(element, {
      mode: 'ir',
      height: 400,
      placeholder: '请输入笔记内容...',
      cache: {
        enable: false
      },
      after: () => {
        console.log('Vditor 初始化完成');
      },
      input: (value: string) => {
        this.handleContentChange(value);
      },
      blur: (value: string) => {
        // 失去焦点时手动保存一次
        // @todo use real user
        this.saveVersion(this.noteId || '', value, '当前用户');
      },
      ...options
    });

    return this.vditor;
  }

  /**
   * 处理内容变更 - 自动保存版本
   */
  private handleContentChange = throttle((value: unknown) => {
    if (!this.autoSaveEnabled) return;
    if (!this.noteId) {
      // use toast instead
      console.warn('未设置 noteId，无法保存版本');
      return;
    }

    const content = String(value);

    const currentNoteId = this.noteId;

    try {
      const saved = this.saveVersion(currentNoteId, content, '当前用户');
      if (saved) {
        console.log('自动保存版本成功');
      }
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  }, this.autoSaveDelay);

  updateNoteId(noteId: string) {
    this.noteId = noteId;
  }

  /**
   * 设置自动保存配置
   */
  setAutoSave(enabled: boolean, delay = 2000) {
    this.autoSaveEnabled = enabled;
    this.autoSaveDelay = delay;
  }

  /**
   * 计算两个文本之间的差异
   */
  calculateDiff(oldText: string, newText: string): NoteDiff[] {
    const diffs = diff(oldText, newText);

    return diffs.map(([type, text]) => ({
      type: type === diff.EQUAL ? 'equal' :
        type === diff.DELETE ? 'delete' : 'insert',
      text
    }));
  }
  /**
   * 生成差异的 HTML 显示
   */
  generateDiffHtml(diffs: NoteDiff[]): string {
    return diffs.map(diff => {
      const escapedText = this.escapeHtml(diff.text);

      switch (diff.type) {
        case 'delete':
          return `<del class="diff-delete">${escapedText}</del>`;
        case 'insert':
          return `<ins class="diff-insert">${escapedText}</ins>`;
        default:
          return escapedText;
      }
    }).join('');
  }
  /**
   * 保存笔记版本 - 只保存与前一版本的差异
   */
  saveVersion(noteId: string, content: string, author?: string): boolean {
    if (!this.versions.has(noteId)) {
      this.versions.set(noteId, []);
    }

    const versions = this.versions.get(noteId)!;

    // 如果是第一个版本，直接保存完整内容
    if (versions.length === 0) {
      const firstVersion: NoteVersion = {
        id: this.generateVersionId(),
        content,
        timestamp: Date.now(),
        author
      };
      versions.push(firstVersion);
      return true;
    }

    // 获取最新版本的内容
    const latestVersion = versions[versions.length - 1];
    const latestContent = this.getVersionContent(noteId, latestVersion.id);

    if (!latestContent) {
      throw new Error('无法获取最新版本内容');
    }

    // 计算差异
    const diffs = this.calculateDiff(latestContent, content);

    // 检查是否有实际差异（忽略纯空白字符的变化）
    const hasSignificantDiff = diffs.some(diff =>
      diff.type !== 'equal' && diff.text.trim() !== ''
    );

    // 如果没有显著差异，不保存新版本
    if (!hasSignificantDiff) {
      console.log('内容无显著变化，跳过版本保存');
      return false;
    }

    // 保存差异版本
    const newVersion: NoteVersion = {
      id: this.generateVersionId(),
      diffs,
      timestamp: Date.now(),
      author,
      baseVersionId: latestVersion.id
    };

    versions.push(newVersion);

    // // 只保留最近的 50 个版本
    // if (versions.length > 50) {
    //   versions.splice(0, versions.length - 50);
    // }

    console.log(`保存版本差异: +${this.getDiffStats(diffs).additions} -${this.getDiffStats(diffs).deletions}`);
    return true;
  }

  /**
   * 获取指定版本的完整内容
   */
  getVersionContent(noteId: string, versionId: string): string | null {
    const versions = this.versions.get(noteId);
    if (!versions) return null;

    const versionIndex = versions.findIndex(v => v.id === versionId);
    if (versionIndex === -1) return null;

    const targetVersion = versions[versionIndex];

    // 如果是第一个版本且有完整内容
    if (targetVersion.content !== undefined) {
      return targetVersion.content;
    }

    // 重建内容：从第一个版本开始应用所有差异
    const firstVersion = versions[0];
    if (!firstVersion.content) {
      throw new Error('第一个版本缺少完整内容');
    }

    let content = firstVersion.content;

    // 依次应用每个版本的差异
    for (let i = 1; i <= versionIndex; i++) {
      const version = versions[i];
      if (version.diffs) {
        content = this.applyPatch(content, version.diffs);
      }
    }

    return content;
  }

  /**
   * 获取所有版本内容
   */
  getAllVersions(noteId: string): NoteVersionRaw[] {
    const versions = this.getVersions(noteId);
    const contents: NoteVersionRaw[] = [];

    versions.forEach(version => {
      contents.push({
        id: version.id,
        content: this.getVersionContent(noteId, version.id) || '',
        timestamp: version.timestamp,
        author: version.author
      });
    });

    return contents;
  }

  /**
   * 获取差异统计信息
   */
  private getDiffStats(diffs: NoteDiff[]): {
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

  /**
   * 获取笔记的所有版本
   */
  getVersions(noteId: string): NoteVersion[] {
    return this.versions.get(noteId) || [];
  }
  /**
   * 比较两个版本的差异
   */
  compareVersions(noteId: string, versionId1: string, versionId2: string): NoteDiff[] | null {
    const content1 = this.getVersionContent(noteId, versionId1);
    const content2 = this.getVersionContent(noteId, versionId2);

    if (!content1 || !content2) return null;

    return this.calculateDiff(content1, content2);
  }
  /**
   * 应用差分补丁
   */
  applyPatch(_originalText: string, diffs: NoteDiff[]): string {
    let result = '';

    for (const diff of diffs) {
      switch (diff.type) {
        case 'equal':
        case 'insert':
          result += diff.text;
          break;
        case 'delete':
          // 删除的内容不添加到结果中
          break;
      }
    }

    return result;
  }
  /**
   * 实时协作差分同步
   */
  async syncCollaborativeDiff(
    _noteId: string,
    localContent: string,
    remoteContent: string
  ): Promise<string> {
    const diffs = this.calculateDiff(localContent, remoteContent);

    // 处理冲突
    const resolvedDiffs = this.resolveConflicts(diffs);

    // 应用合并后的差异
    return this.applyPatch(localContent, resolvedDiffs);
  }


  /**
   * 解决差分冲突
   */
  private resolveConflicts(diffs: NoteDiff[]): NoteDiff[] {
    // 简单的冲突解决策略：优先保留插入的内容
    return diffs.filter(diff => diff.type !== 'delete' || diff.text.trim() === '');
  }

  /**
   * 转义 HTML 字符
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 生成版本 ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取当前编辑器内容
   */
  getCurrentContent(): string {
    return this.vditor?.getValue() || '';
  }

  /**
   * 设置编辑器内容
   */
  setContent(content: string): void {
    this.vditor?.setValue(content);
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.vditor?.destroy();
    this.vditor = undefined;
  }
}

// 导出单例实例
export const noteDiffEngine = new NoteDiffEngine();

