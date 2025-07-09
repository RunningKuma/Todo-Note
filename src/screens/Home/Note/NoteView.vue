<script setup lang="ts">
import { Tree } from 'primevue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import NoteTree from './components/NoteTree.vue';
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { noteDiffEngine } from '@/api/note/diffEngine';
import 'vditor/dist/index.css';
import { Note, NoteTreeNode } from '@/api/types/note';
import { testNote, testTreeData } from '@/api/constants/test';
import NoteMeta from './components/NoteMeta.vue';
import { TreeNode } from 'primevue/treenode';

const visible = defineModel<boolean>({
  default: true,
  type: Boolean
});
const actions: PageHeaderAction[] = [
  {
    label: '刷新',
    icon: 'pi pi-refresh',
    onClick: () => {
      // @todo to implement
    }
  },
  {
    label: '历史记录',
    icon: 'pi pi-history',
    onClick: () => {
      // @todo to implement
    }
  },
  {
    label: '导出',
    icon: 'pi pi-upload',
    onClick: () => {
      // @todo to implement
    }
  },
  {
    label: '更多',
    icon: 'pi pi-ellipsis-h',
    onClick: () => {
      // @todo to implement
    }
  }
]
const vditorElement = ref<HTMLDivElement | undefined>();
const noteId = ref('demo-note-001');
const note = ref<Note>(testNote);
const noteTreeNodes = ref<NoteTreeNode[]>(testTreeData)
watch(
  () => noteId.value,
  async (newId) => {
    // 每次切换笔记时，重新加载版本列表
    // versions.value = await noteDiffEngine.getAllVersions(newId);
    // diffHtml.value = '';
    // selectedVersions.value = [];
    noteDiffEngine.updateNoteId(newId);
    if (!noteDiffEngine.isInitialized) return
    noteDiffEngine.setContent(note.value.content);
  },
  { immediate: true }
);

onMounted(async () => {
  if (vditorElement.value) {
    await noteDiffEngine.initVditor(vditorElement.value, {
      height: '100%',
      placeholder: 'Start Typing Here...',
    });
    noteDiffEngine.setAutoSave(true, 2 * 60 * 1000);
    noteDiffEngine.setContent(note.value.content);
  }
});

onUnmounted(() => {
  noteDiffEngine.destroy();
});
// const noteNode =
</script>
<template>
  <div class="h-full flex overflow-hidden">
    <NoteTree :note-tree-nodes="noteTreeNodes" />
    <div class="h- flex-1">
      <PageHeader v-model:visible="visible" v-model:note_title="note.meta.title" title="Note" :actions="actions" />
      <NoteMeta v-model="note.meta" class="px-6 pb-1" />
      <div ref="vditorElement" class="h-ful border-2 border-gray-200 rounded-2xl"></div>

    </div>
  </div>
</template>