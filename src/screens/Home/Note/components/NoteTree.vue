<script setup lang="ts">
import { testTreeData } from '@/api/constants/test';
import { Button, ButtonGroup, Tree, TreeExpandedKeys, TreeSelectionKeys } from 'primevue';
import { TreeNode } from 'primevue/treenode';
import { computed, ref } from 'vue';

const noteTreeNodes = ref<TreeNode[]>(testTreeData)
const selectedNode = ref<TreeSelectionKeys>({});
const expandedKeys = ref<TreeExpandedKeys>({});

const expandAll = () => {
  for (let node of noteTreeNodes.value) {
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
console.log(expendedNum)
</script>
<template>
  <Tree :value="noteTreeNodes" v-model:selection-keys="selectedNode" v-model:expanded-keys="expandedKeys"
    class="w-note-sidebar h-full overflow-y-auto" selectionMode="single" :filter="true" filterBy="label"
    filterPlaceholder="搜索笔记..." @node-select="handleNoteSelect">
    <template #header>
      <div class="flex">
        <span class="text-lg font-semibold">笔记树</span>
        <ButtonGroup class="ml-auto">
          <Button
            :class="(expendedNum < noteTreeNodes.length ? 'w-8!' : 'w-0! p-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-down" size="small" severity="secondary" outlined @click="expandAll" />
          <Button
            :class="(expendedNum !== noteTreeNodes.values.length ? 'w-8!' : 'w-0! p-0!') + ' h-8! transition-all! duration-300! overflow-hidden'"
            icon="pi pi-angle-up" size="small" severity="secondary" outlined @click="collapseAll" />
        </ButtonGroup>
      </div>
    </template>
  </Tree>
</template>