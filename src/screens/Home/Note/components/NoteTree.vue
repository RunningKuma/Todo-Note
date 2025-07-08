<script setup lang="ts">
import { testTreeData } from '@/api/constants/test';
import { NoteTreeNode } from '@/api/types/note';
import { Button, ButtonGroup, Tree, TreeExpandedKeys, TreeSelectionKeys } from 'primevue';
import { TreeNode } from 'primevue/treenode';
import { computed, ref } from 'vue';

// const { noteTreeNodes } = defineProps<{ noteTreeNodes: NoteTreeNode[] }>({ noteTreeNodes: () => [] });
const { noteTreeNodes } = withDefaults(defineProps<{
  noteTreeNodes: NoteTreeNode[];
}>(), {
  noteTreeNodes: () => []
});
const selectedNode = ref<TreeSelectionKeys>({});
const expandedKeys = ref<TreeExpandedKeys>({});

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
  console.log(selectedNode.value);
}
const expendedNum = computed(() => Object.keys(expandedKeys.value).length)
const folderNum = computed(() => {
  const countFolders = (nodes: TreeNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (node.type === 'folder') {
        count++;
      }
      if (node.children && node.children.length > 0) {
        count += countFolders(node.children);
      }
    }
    return count;
  };

  return countFolders(noteTreeNodes);
});
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
            :class="(expendedNum < folderNum ? 'w-8!' : 'w-0! p-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-down" size="small" severity="secondary" outlined @click="expandAll" />
          <Button
            :class="(expendedNum !== 0 ? 'w-8!' : 'w-0! p-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-up" size="small" severity="secondary" outlined @click="collapseAll" />
        </ButtonGroup>
      </div>
    </template>
    <template #nodeicon="{ node }">
      <i :class="node.type === 'folder' ? 'pi pi-folder' : 'pi pi-file'" class="text-secondary"></i>
    </template>
  </Tree>
</template>