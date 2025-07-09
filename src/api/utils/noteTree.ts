import { NoteTreeNode } from '../types/note';
import { NoteId } from '../types/gerneral';

export const noteTreeTool = {
	/**
	 * 递归删除节点
	 * @param nodes 节点数组
	 * @param noteId 要删除的节点ID
	 * @returns 删除后的节点数组
	 */
	removeNodeRecursively(nodes: NoteTreeNode[], noteId: NoteId): NoteTreeNode[] {
		return nodes.filter(node => {
			if (node.key === noteId) {
				return false; // 删除匹配的节点
			}
			if (node.children && node.children.length > 0) {
				node.children = this.removeNodeRecursively(node.children, noteId);
			}
			return true;
		});
	},

	/**
	 * 递归移动节点的工具函数
	 * @param nodes 节点数组
	 * @param nodeId 要移动的节点ID
	 * @param targetParentId 目标父级ID（null表示根级别）
	 * @param targetIndex 目标索引
	 * @returns 移动后的节点数组
	 */
	moveNodeInTree(nodes: NoteTreeNode[], nodeId: string, targetParentId: string | null, targetIndex: number): NoteTreeNode[] {
		// 首先找到并移除要移动的节点
		let nodeToMove: NoteTreeNode | null = null;

		const removeNode = (nodes: NoteTreeNode[]): NoteTreeNode[] => {
			return nodes.filter(node => {
				if (node.key === nodeId) {
					nodeToMove = node;
					return false;
				}
				if (node.children && node.children.length > 0) {
					node.children = removeNode(node.children);
				}
				return true;
			});
		};

		// 从树中移除节点
		const newNodes = removeNode([...nodes]);

		if (!nodeToMove) {
			return nodes; // 如果没找到节点，返回原数组
		}

		// 如果目标父级为 null，则插入到根级别
		if (targetParentId === null) {
			newNodes.splice(targetIndex, 0, nodeToMove);
			return newNodes;
		}

		// 递归查找目标父级并插入节点
		const insertNode = (nodes: NoteTreeNode[]): NoteTreeNode[] => {
			return nodes.map(node => {
				if (node.key === targetParentId) {
					if (!node.children) {
						node.children = [];
					}
					node.children.splice(targetIndex, 0, nodeToMove!);
				} else if (node.children && node.children.length > 0) {
					node.children = insertNode(node.children);
				}
				return node;
			});
		};

		return insertNode(newNodes);
	},

	/**
	 * 查找节点的父级和索引
	 * @param nodes 节点数组
	 * @param nodeKey 要查找的节点key
	 * @param parentId 父级ID
	 * @returns 包含父级ID和索引的对象，如果未找到返回null
	 */
	findNodeParentAndIndex(nodes: NoteTreeNode[], nodeKey: string, parentId: string | null = null): { parentId: string | null, index: number } | null {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.key === nodeKey) {
				return { parentId, index: i };
			}
			if (node.children) {
				const result = this.findNodeParentAndIndex(node.children, nodeKey, node.key as string);
				if (result) return result;
			}
		}
		return null;
	},

	/**
	 * 检查是否是后代节点
	 * @param ancestor 祖先节点
	 * @param node 要检查的节点
	 * @returns 是否是后代节点
	 */
	isDescendant(ancestor: NoteTreeNode, node: NoteTreeNode): boolean {
		if (!ancestor.children) return false;

		for (const child of ancestor.children) {
			if (child.key === node.key || this.isDescendant(child, node)) {
				return true;
			}
		}
		return false;
	},

	/**
	 * 深度遍历节点树
	 * @param nodes 节点数组
	 * @param callback 回调函数
	 */
	traverseNodes(nodes: NoteTreeNode[], callback: (node: NoteTreeNode, parent?: NoteTreeNode) => void, parent?: NoteTreeNode): void {
		for (const node of nodes) {
			callback(node, parent);
			if (node.children && node.children.length > 0) {
				this.traverseNodes(node.children, callback, node);
			}
		}
	},

	/**
	 * 根据key查找节点
	 * @param nodes 节点数组
	 * @param key 要查找的key
	 * @returns 找到的节点，如果未找到返回null
	 */
	findNodeByKey(nodes: NoteTreeNode[], key: string): NoteTreeNode | null {
		for (const node of nodes) {
			if (node.key === key) {
				return node;
			}
			if (node.children) {
				const found = this.findNodeByKey(node.children, key);
				if (found) return found;
			}
		}
		return null;
	},

	/**
	 * 获取节点的完整路径
	 * @param nodes 节点数组
	 * @param key 要查找的key
	 * @returns 从根到目标节点的路径数组
	 */
	getNodePath(nodes: NoteTreeNode[], key: string): NoteTreeNode[] {
		const path: NoteTreeNode[] = [];

		const findPath = (nodes: NoteTreeNode[], currentPath: NoteTreeNode[]): boolean => {
			for (const node of nodes) {
				const newPath = [...currentPath, node];
				if (node.key === key) {
					path.push(...newPath);
					return true;
				}
				if (node.children && findPath(node.children, newPath)) {
					return true;
				}
			}
			return false;
		};

		findPath(nodes, []);
		return path;
	},

	/**
	 * 收集节点及其所有子孙节点的ID
	 * @param node 要收集的节点
	 * @returns 所有节点ID的数组
	 */
	collectAllNodeIds(node: NoteTreeNode): string[] {
		const ids: string[] = [node.key as string];

		if (node.children && node.children.length > 0) {
			for (const child of node.children) {
				ids.push(...this.collectAllNodeIds(child));
			}
		}

		return ids;
	},

	/**
	 * 收集指定节点下所有笔记类型的节点ID
	 * @param node 要收集的节点
	 * @returns 所有笔记类型节点ID的数组
	 */
	collectAllNoteIds(node: NoteTreeNode): string[] {
		const noteIds: string[] = [];

		// 如果当前节点是笔记类型，添加到结果中
		if (node.type === 'note') {
			noteIds.push(node.key as string);
		}

		// 递归收集子节点中的笔记
		if (node.children && node.children.length > 0) {
			for (const child of node.children) {
				noteIds.push(...this.collectAllNoteIds(child));
			}
		}

		return noteIds;
	},
}