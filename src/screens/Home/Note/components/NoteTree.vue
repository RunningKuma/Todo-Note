<script setup lang="ts">
import { NoteId } from '@/api/types/gerneral';
import { NoteTreeNode, NoteTreeType } from '@/api/types/note';
import { useToastHelper } from '@/api/utils/toast';
import { Badge, Button, ButtonGroup, Menu, Tree, TreeExpandedKeys, TreeSelectionKeys } from 'primevue';
import { MenuItem } from 'primevue/menuitem';
import { TreeNode } from 'primevue/treenode';
import { computed, ref } from 'vue';

const { noteTreeNodes = [] } = defineProps<{ noteTreeNodes: NoteTreeNode[] }>();
// const { noteTreeNodes } = withDefaults(defineProps<{
//   noteTreeNodes: NoteTreeNode[];
// }>(), {
//   noteTreeNodes: () => []
// });
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'create', type: NoteTreeType): void;
  (e: 'deleteNote', noteId: string): void;
  (e: 'moveNode', data: { nodeId: string, targetParentId: string | null, targetIndex: number }): void;
}>();

const selectedNode = ref<TreeSelectionKeys>({});
const expandedKeys = ref<TreeExpandedKeys>({});
const menuNoteId = ref<NoteId>();
const createTypeDisplay = ref<boolean>(false); // 是否显示创建类型选择
let createTypeTimeout: ReturnType<typeof setTimeout> | null = null;

// 拖拽相关状态
const draggedNode = ref<NoteTreeNode | null>(null);
const dragOverNode = ref<NoteTreeNode | null>(null);
const dragPosition = ref<'top' | 'middle' | 'bottom'>('middle');

const toast = useToastHelper()

const noteMenuItems: MenuItem[] = [
  {
    label: 'Close',
    items: [
      {
        label: 'Export',
        icon: 'pi pi-upload',
        command: (event) => {
          // @todo to implement
          event.originalEvent.stopPropagation();
          console.log('Export Note');
          toast.info('Export Note feature is not implemented yet.');
        }
      },
      {
        label: 'Rename',
        icon: 'pi pi-pencil',
        command: (event) => {
          // @todo to implement
          event.originalEvent.stopPropagation();
          toast.info('Rename Note feature is not implemented yet.');
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        // style: { color: 'red' },
        command: (event) => {
          // @todo to implement
          event.originalEvent.stopPropagation();
          emit('deleteNote', menuNoteId.value!);
        }
      },

    ]
  }
]

const processNodes = (nodes: NoteTreeNode[]): number => {
  let folderCount = 0;

  for (const node of nodes) {
    if (node.type === 'folder') {
      // 设置文件夹节点不可选择
      node.selectable = false;
      folderCount++;
    }

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      folderCount += processNodes(node.children);
    }
  }
  return folderCount;
};
const folderNum = computed(() => {
  return processNodes([...noteTreeNodes]); // 使用浅拷贝避免直接修改 props
});
const expendedNum = computed(() => Object.keys(expandedKeys.value).length)

const expandAll = () => {
  for (let node of noteTreeNodes) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};

const collapseAll = () => {
  expandedKeys.value = {};
};

const expandNode = (node: TreeNode) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

function handleAddOFolderClick() {
  if (createTypeDisplay.value) {
    //! 居然不能在模板中访问 timeout 相关函数吗()
    clearTimeout(createTypeTimeout!);
    createTypeDisplay.value = false;
    emit('create', 'folder');
  }
  else {
    createTypeDisplay.value = true;
    createTypeTimeout = setTimeout(() => {
      createTypeDisplay.value = false;
    }, 2000);
  }
}
function handleFileClick() {
  clearTimeout(createTypeTimeout!);
  createTypeDisplay.value = false;
  emit('create', 'note')
}

// 拖拽处理函数
const handleDragStart = (event: DragEvent, node: NoteTreeNode) => {
  draggedNode.value = node;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', node.key as string);
  }
};

const handleDragOver = (event: DragEvent, node: NoteTreeNode) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  dragOverNode.value = node;

  // 计算拖拽位置
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const y = event.clientY - rect.top;
  const height = rect.height;

  if (y < height / 3) {
    dragPosition.value = 'top';
  } else if (y > (height * 2) / 3) {
    dragPosition.value = 'bottom';
  } else {
    dragPosition.value = 'middle';
  }
};

const handleDragLeave = () => {
  dragOverNode.value = null;
  dragPosition.value = 'middle';
};

const handleDrop = (event: DragEvent, targetNode: NoteTreeNode) => {
  event.preventDefault();

  if (!draggedNode.value || draggedNode.value.key === targetNode.key) {
    return;
  }

  // 防止将父节点拖到子节点中
  // 这里 ai 参数反了😅
  if (isDescendant(draggedNode.value, targetNode)) {
    toast.error('不能将文件夹移动到其子节点中');
    return;
  }

  let targetParentId: string | null = null;
  let targetIndex = 0;

  if (dragPosition.value === 'middle' && targetNode.type === 'folder') {
    // 拖到文件夹内部
    targetParentId = targetNode.key as string;
    targetIndex = targetNode.children?.length || 0;
  } else {
    // 拖到节点前后
    const result = findNodeParentAndIndex(noteTreeNodes, targetNode.key as string);
    if (result) {
      targetParentId = result.parentId;
      targetIndex = result.index + (dragPosition.value === 'bottom' ? 1 : 0);
    }
  }

  emit('moveNode', {
    nodeId: draggedNode.value.key as string,
    targetParentId,
    targetIndex
  });

  // 重置拖拽状态
  draggedNode.value = null;
  dragOverNode.value = null;
  dragPosition.value = 'middle';
};

// 检查是否是后代节点
const isDescendant = (ancestor: NoteTreeNode, node: NoteTreeNode): boolean => {
  if (!ancestor.children) return false;

  for (const child of ancestor.children) {
    if (child.key === node.key || isDescendant(child, node)) {
      return true;
    }
  }
  return false;
};

// 查找节点的父级和索引
const findNodeParentAndIndex = (nodes: NoteTreeNode[], nodeKey: string, parentId: string | null = null): { parentId: string | null, index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.key === nodeKey) {
      return { parentId, index: i };
    }
    if (node.children) {
      const result = findNodeParentAndIndex(node.children, nodeKey, node.key as string);
      if (result) return result;
    }
  }
  return null;
};

// 获取拖拽样式
const getDragClass = (node: NoteTreeNode) => {
  if (dragOverNode.value?.key === node.key) {
    switch (dragPosition.value) {
      case 'top':
        return 'drag-over-top';
      case 'bottom':
        return 'drag-over-bottom';
      case 'middle':
        return node.type === 'folder' ? 'drag-over-folder' : '';
      default:
        return '';
    }
  }
  return '';
};

function handleNoteSelect(e: TreeNode) {
  console.log(e);
  // @todo to implement
}
console.log(expendedNum)
</script>
<template>
  <Tree :value="noteTreeNodes" v-model:selection-keys="selectedNode" v-model:expanded-keys="expandedKeys"
    class="w-note-sidebar h-full overflow-y-auto" selectionMode="single" :filter="true" filterBy="label"
    filterPlaceholder="搜索笔记..." @node-select="handleNoteSelect">
    <template #header>
      <div class="flex">
        <span class="text-lg font-semibold">我的笔记</span>
        <ButtonGroup class="ml-auto">
          <Button
            :class="(expendedNum < folderNum ? 'w-8!' : 'w-0! p-0! border-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-down" size="small" severity="secondary" outlined @click="expandAll" />
          <Button
            :class="(expendedNum !== 0 ? 'w-8!' : 'w-0! p-0! border-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-up" size="small" severity="secondary" outlined @click="collapseAll" />
          <Button class="h-8! transition-all! duration-300! overflow-hidden" icon="pi pi-refresh" size="small"
            severity="secondary" outlined @click="emit('refresh')" />
          <Button class="h-8! transition-all! duration-300! overflow-hidden"
            :icon="'pi ' + (createTypeDisplay ? 'pi-folder' : 'pi-plus')" size="small" severity="secondary" outlined
            @click="handleAddOFolderClick" />
          <Button
            :class="(createTypeDisplay ? 'w-8!' : 'w-0! p-0! border-l-0') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-file" size="small" severity="secondary" outlined @click="handleFileClick" />
        </ButtonGroup>
      </div>
    </template>
    <!--  -->
    <template #nodeicon="{ node }">
      <i :class="(node.type === 'folder' ? 'pi pi-folder' : 'pi pi-file') + ' text-primary mr-1'"
        class="text-secondary"></i>
    </template>
    <template #default="{ node }">
      <div class="flex items-center w-full relative" :class="getDragClass(node as NoteTreeNode)" draggable="true"
        @dragstart="(event) => handleDragStart(event, node as NoteTreeNode)"
        @dragover="(event) => handleDragOver(event, node as NoteTreeNode)" @dragleave="handleDragLeave"
        @drop="(event) => handleDrop(event, node as NoteTreeNode)">
        <span class="text-secondary flex-1">{{ node.label }}</span>
        <Badge v-if="(node as NoteTreeNode).type === 'folder'" class="ml-2" severity="secondary"
          :value='node.children?.length || 0' />
        <Button class="size-6! text-xs! ml-2" severity="secondary" rounded outlined
          :icon="menuNoteId === node.key ? 'pi pi-times' : 'pi pi-ellipsis-h'" @click.stop="() => {
            if (menuNoteId === node.key) {
              menuNoteId = undefined;
            } else {
              menuNoteId = node.key;
            }
          }" />
        <Menu v-if="!(draggedNode && draggedNode.key === node.key)"
          :class="(menuNoteId === node.key ? 'h-40' : 'h-0! border-0!') + ' overflow-hidden absolute z-10 transition-all duration-300'"
          :model="noteMenuItems" @blur="menuNoteId = undefined" append-to="body" />
      </div>
    </template>
  </Tree>
</template>

<style scoped>
.drag-over-top {
  border-top: 2px solid #3b82f6;
}

.drag-over-bottom {
  border-bottom: 2px solid #3b82f6;
}

.drag-over-folder {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px dashed #3b82f6;
}

/* 拖拽时的光标样式 */
[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}

/* 拖拽时降低透明度 */
.dragging {
  opacity: 0.5;
}
</style>