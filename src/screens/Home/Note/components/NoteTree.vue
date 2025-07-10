<script setup lang="ts">
import { NoteId } from '@/api/types/gerneral';
import { NoteTreeNode, NoteTreeType } from '@/api/types/note';
import { useToastHelper } from '@/api/utils/toast';
import { noteTreeTool } from '@/api/utils/noteTree';
import { Badge, Button, ButtonGroup, InputText, Tree, TreeExpandedKeys, TreeSelectionKeys } from 'primevue';
import { TreeNode } from 'primevue/treenode';
import { computed, nextTick, ref } from 'vue';

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
  (e: 'renameNode', data: { nodeId: string, newName: string }): void;
  (e: 'select', node: TreeNode): void;
}>();

const selectedNode = ref<TreeSelectionKeys>({});
const expandedKeys = ref<TreeExpandedKeys>({});
const menuNoteId = ref<NoteId>();
const currentMenuNode = ref<NoteTreeNode | null>(null);
const menuPosition = ref({ x: 0, y: 0 });
const menuVisible = ref(false);

// 内联重命名相关状态
const inlineEditingNodeId = ref<string | null>(null);
const inlineEditValue = ref('');

const createTypeDisplay = ref<boolean>(false); // 是否显示创建类型选择
let createTypeTimeout: ReturnType<typeof setTimeout> | null = null;

// 拖拽相关状态
const draggedNode = ref<NoteTreeNode | null>(null);
const dragOverNode = ref<NoteTreeNode | null>(null);
const dragPosition = ref<'top' | 'middle' | 'bottom'>('middle');

const toast = useToastHelper()

// 菜单项配置
const menuItems = [
  {
    label: 'Export',
    icon: 'pi pi-upload',
    action: () => {
      toast.info('Export Note feature is not implemented yet.');
      closeMenu();
    }
  },
  {
    label: 'Rename',
    icon: 'pi pi-pencil',
    action: () => {
      if (currentMenuNode.value) {
        startInlineEdit(currentMenuNode.value);
      }
    }
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    action: () => {
      if (currentMenuNode.value) {
        emit('deleteNote', currentMenuNode.value.key as string);
      }
      closeMenu();
    }
  }
];

// 显示菜单
const showMenu = (event: MouseEvent, node: NoteTreeNode) => {
  event.stopPropagation();

  const buttonRect = (event.target as HTMLElement).getBoundingClientRect();

  menuPosition.value = {
    x: buttonRect.right + 8, // 按钮右侧 8px
    y: buttonRect.top
  };

  currentMenuNode.value = node;
  menuNoteId.value = node.key as NoteId;
  menuVisible.value = true;

  // 添加点击外部关闭菜单的监听
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
};

// 关闭菜单
const closeMenu = () => {
  menuVisible.value = false;
  menuNoteId.value = undefined;
  currentMenuNode.value = null;
  document.removeEventListener('click', handleClickOutside);
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.note-menu') && !target.closest('.menu-button')) {
    closeMenu();
  }
};

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

// 开始内联编辑
const startInlineEdit = (node: NoteTreeNode) => {
  inlineEditingNodeId.value = node.key as string;
  inlineEditValue.value = node.label as string;
  closeMenu();

  //! autofocus 似乎不生效（
  nextTick(() => {
    const inputElement = document.querySelector<HTMLInputElement>('.p-inputtext');
    if (inputElement) {
      inputElement.focus();
      inputElement.select(); // 选中输入框内容
    }
  });
};

// 确认内联编辑
const confirmInlineEdit = () => {
  if (!inlineEditingNodeId.value || !inlineEditValue.value.trim()) {
    toast.error('请输入有效的名称');
    return;
  }

  // 调用父组件的重命名方法
  emit('renameNode', {
    nodeId: inlineEditingNodeId.value,
    newName: inlineEditValue.value.trim()
  });

  cancelInlineEdit();
};

// 取消内联编辑
const cancelInlineEdit = () => {
  inlineEditingNodeId.value = null;
  inlineEditValue.value = '';
};

// 处理内联编辑的键盘事件
const handleInlineEditKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    confirmInlineEdit();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelInlineEdit();
  }
};

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
  if (noteTreeTool.isDescendant(draggedNode.value, targetNode)) {
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
    const result = noteTreeTool.findNodeParentAndIndex(noteTreeNodes, targetNode.key as string);
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

console.log(expendedNum)
</script>
<template>
  <Tree :value="noteTreeNodes" v-model:selection-keys="selectedNode" v-model:expanded-keys="expandedKeys"
    class="w-note-sidebar h-full overflow-y-auto" selectionMode="single" :filter="true" filterBy="label"
    filterPlaceholder="搜索笔记..." @node-select="emit('select', $event)">
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
      <div class="flex items-center w-full relative" :class="getDragClass(node as NoteTreeNode)"
        :data-node-id="node.key" :draggable="inlineEditingNodeId === null"
        @dragstart="(event) => handleDragStart(event, node as NoteTreeNode)"
        @dragover="(event) => handleDragOver(event, node as NoteTreeNode)" @dragleave="handleDragLeave"
        @drop="(event) => handleDrop(event, node as NoteTreeNode)">

        <!-- 普通显示状态 -->
        <span v-if="inlineEditingNodeId !== node.key" class="text-secondary flex-1">{{ node.label }}</span>

        <!-- 内联编辑状态 -->
        <InputText v-else v-model="inlineEditValue" class="w-full! p-0! flex-1 text-sm" size="small"
          :class="{ 'p-invalid': !inlineEditValue.trim() }" @click.stop @keydown="handleInlineEditKeydown"
          @blur="cancelInlineEdit" autofocus />

        <Badge v-if="(node as NoteTreeNode).type === 'folder'" class="ml-2" severity="secondary"
          :value='node.children?.length || 0' />
        <Button class="size-6! text-xs! ml-2 menu-button" severity="secondary" rounded outlined
          :icon="menuNoteId === node.key ? 'pi pi-times' : 'pi pi-ellipsis-h'" @click.stop="(event) => {
            event.stopPropagation
            if (menuNoteId === node.key) {
              closeMenu();
            } else {
              showMenu(event, node as NoteTreeNode);
            }
          }" />
      </div>
    </template>
  </Tree>

  <!-- 自定义菜单 -->
  <div v-if="menuVisible"
    class="note-menu fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-32"
    :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }">
    <div v-for="item in menuItems" :key="item.label"
      class="menu-item flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      @click="item.action">
      <i :class="item.icon" class="text-xs"></i>
      <span>{{ item.label }}</span>
    </div>
  </div>
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

/* 菜单样式 */
.note-menu {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.note-menu .menu-item:hover {
  background-color: #f3f4f6;
}

.note-menu .menu-item:last-child {
  color: #dc2626; /* 删除按钮红色 */
}

.note-menu .menu-item:last-child:hover {
  background-color: #fef2f2;
}
</style>