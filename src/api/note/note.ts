import Vditor from 'vditor';
import diff from 'fast-diff';
import { throttle } from '../utils/perform';

export interface NoteDiff {
  type: 'equal' | 'delete' | 'insert';
  text: string;
}

export interface NoteVersion {
  id: string;
  content: string;
  timestamp: number;
  author?: string;
}

export class NoteDiffEngine {
  private vditor?: Vditor;
  private versions: Map<string, NoteVersion[]> = new Map();

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
      ...options
    });

    return this.vditor;
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
   * 保存笔记版本
   */
  saveVersion(noteId: string, content: string, author?: string): void {
    if (!this.versions.has(noteId)) {
      this.versions.set(noteId, []);
    }

    const versions = this.versions.get(noteId)!;
    const newVersion: NoteVersion = {
      id: this.generateVersionId(),
      content,
      timestamp: Date.now(),
      author
    };

    versions.push(newVersion);

    // 只保留最近的 50 个版本
    if (versions.length > 50) {
      versions.splice(0, versions.length - 50);
    }
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
    const versions = this.versions.get(noteId);
    if (!versions) return null;

    const version1 = versions.find(v => v.id === versionId1);
    const version2 = versions.find(v => v.id === versionId2);

    if (!version1 || !version2) return null;

    return this.calculateDiff(version1.content, version2.content);
  }  /**
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

