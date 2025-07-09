<script setup lang="ts">
import { Tree } from 'primevue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import NoteTree from './components/NoteTree.vue';
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { noteDiffEngine } from '@/api/note/diffEngine';
import 'vditor/dist/index.css';
import { Note, NoteMeta as NoteMetaType, NoteTreeNode, NoteTreeType } from '@/api/types/note';
import { testNote, testTreeData } from '@/api/constants/test';
import { TreeNode } from 'primevue/treenode';
import { noteOps } from '@/api/note/note';
import { useToastHelper } from '@/api/utils/toast';
import { createEmptyNoteMeta } from '@/api/utils/note';
import NoteMeta from './components/NoteMeta.vue';
import { NoteId } from '@/api/types/gerneral';

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
const toast = useToastHelper()


const noteId = ref('demo-note-001');
const note = ref<Note>(testNote);
const noteTreeNodes = ref<NoteTreeNode[]>(testTreeData)

function updateNoteTree() {
  noteOps.getNoteTree().then((res) => {
    if (res.success) {
      noteTreeNodes.value = res.data!;
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to fetch note tree:', error);
  })
}
updateNoteTree();

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
watch(
  () => note.value.meta.title,
  async () => {
    updateNoteTree()
  }
)

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

function handleNoteTreeRefresh() {
  noteOps.getNoteTree().then((res) => {
    if (res.success) {
      noteTreeNodes.value = res.data!;
      toast.success('笔记目录刷新成功');
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to fetch note tree:', error);
  });
}
function handleUpdateNoteTree() {
  noteOps.updateNoteTree(noteTreeNodes.value).then((res) => {
    if (res.success) {
      toast.success('笔记目录更新成功');
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to update note tree:', error);
  });
}
function handleCreate(type: NoteTreeType) {
  const newNoteMeta: NoteMetaType = createEmptyNoteMeta()
  noteOps.createNote(newNoteMeta).then((res) => {
    if (res.success) {
      noteTreeNodes.value.push({
        key: newNoteMeta.id,
        label: newNoteMeta.title,
        type: type,
      } as NoteTreeNode);
      handleUpdateNoteTree()
      toast.success(`'新建'+'${type === 'folder' ? '文件夹' : '笔记'}'+'成功'`);
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to create note:', error);
  });
}
const removeNodeRecursively = (nodes: NoteTreeNode[], noteId: NoteId): NoteTreeNode[] => {
  return nodes.filter(node => {
    if (node.key === noteId) {
      return false; // 删除匹配的节点
    }
    if (node.children && node.children.length > 0) {
      node.children = removeNodeRecursively(node.children, noteId);
    }
    return true;
  });
}
function handleDeleteNote(noteId: string) {
  noteOps.deleteNote(noteId).then((res) => {
    if (res.success) {
      noteTreeNodes.value = removeNodeRecursively(noteTreeNodes.value, noteId);
      handleUpdateNoteTree()
      toast.success('笔记删除成功');
    } else {
      if (res.message === '笔记不存在') {
        noteTreeNodes.value = removeNodeRecursively(noteTreeNodes.value, noteId);
      }
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to delete note:', error);
  });
}
// const noteNode =
</script>
<template>
  <div class="h-full flex overflow-hidden">
    <NoteTree :note-tree-nodes="noteTreeNodes" @refresh="handleNoteTreeRefresh" @create="handleCreate"
      @delete-note="handleDeleteNote" />
    <div class="h- flex-1">
      <!-- @todo title rename 后还需要更新树形结构艹…… -->
      <PageHeader v-model:visible="visible" v-model:note_title="note.meta.title" title="Note" :actions="actions" />
      <NoteMeta v-model="note.meta" class="px-6 pb-1" />
      <div ref="vditorElement" class="h-ful border-2 border-gray-200 rounded-2xl"></div>

    </div>
  </div>
</template>