<script setup lang="ts">
import { testTreeData } from '@/api/constants/test';
import { noteOps } from '@/api/note/note';
import { NoteId } from '@/api/types/gerneral';
import { NoteTreeNode } from '@/api/types/note';
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
  (e: 'createNote'): void;
  (e: 'deleteNote', noteId: string): void;
}>();

const selectedNode = ref<TreeSelectionKeys>({});
const expandedKeys = ref<TreeExpandedKeys>({});
const menuNoteId = ref<NoteId>();

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
          <Button class="h-8! transition-all! duration-300! overflow-hidden" icon="pi pi-plus" size="small"
            severity="secondary" outlined @click="emit('createNote')" />
        </ButtonGroup>
      </div>
    </template>
    <!--  -->
    <template #nodeicon="{ node }">
      <i :class="(node.type === 'folder' ? 'pi pi-folder' : 'pi pi-file') + ' text-primary mr-1'"
        class="text-secondary"></i>
    </template>
    <template #default="{ node }"><!-- class="flex items-center w-full" style="display: inline-block;" -->
      <span class="text-secondary">{{ node.label }}</span>
      <Badge v-if="node.type === 'folder'" class="ml-2" severity="secondary" :value='node.children?.length || 0' />
      <Button v-if="node.type === 'note'" class="size-6! text-xs! ml-2" severity="secondary" rounded outlined
        :icon="menuNoteId === node.key ? 'pi pi-times' : 'pi pi-ellipsis-h'" @click.stop="() => {
          // menu.value.toggle(event)
          if (menuNoteId === node.key) {
            menuNoteId = undefined;
          } else {
            menuNoteId = node.key;
          }
        }" />
      <Menu
        :class="(menuNoteId === node.key ? 'h-40' : 'h-0! border-0!') + ' overflow-hidden absolute z-10 transition-all duration-300'"
        :model="noteMenuItems" @blur="menuNoteId = undefined" />
      <!-- ref="menu" -->
    </template>
  </Tree>
</template>