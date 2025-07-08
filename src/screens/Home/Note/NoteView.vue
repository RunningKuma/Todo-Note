<script setup lang="ts">
import { Tree } from 'primevue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import NoteTree from './components/NoteTree.vue';
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { noteDiffEngine } from '@/api/note/note';
import 'vditor/dist/index.css';
import { Note } from '@/api/types/note';
import { testNote } from '@/api/constants/test';
import NoteMeta from './components/NoteMeta.vue';

const visible = defineModel<boolean>({
  default: true,
  type: Boolean
});
const actions: PageHeaderAction[] = [
  {
    label: '导出',
    icon: 'pi pi-upload',
    onClick: () => {
      // @todo to implement
    }
  },
  // {
  //   label: '创建',
  //   icon: 'pi pi-plus',
  //   onClick: () => {
  //     // @todo to implement
  //     handleTodoDialogToggle(true);
  //   }
  // }
]
const vditorElement = ref<HTMLDivElement | undefined>();
const noteId = ref('demo-note-001');
const note = ref<Note>(testNote);
watch(
  () => noteId.value,
  async (newId) => {
    // 每次切换笔记时，重新加载版本列表
    // versions.value = await noteDiffEngine.getAllVersions(newId);
    // diffHtml.value = '';
    // selectedVersions.value = [];
    noteDiffEngine.updateNoteId(newId);
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
    // noteDiffEngine.setAutoSave(true, 2 * 60 * 1000);
  }
});

onUnmounted(() => {
  noteDiffEngine.destroy();
});
// const noteNode =
</script>
<template>
  <div class="h-full flex overflow-hidden">
    <NoteTree />
    <div class="h- flex-1">
      <PageHeader v-model="visible" title="Note" :note_title="note.meta.title" :actions="actions" />
      <NoteMeta v-bind="note.meta" class="p-4" />
      <div ref="vditorElement" class="h-ful border-2 border-gray-200 rounded-2xl"></div>

    </div>
  </div>
</template>