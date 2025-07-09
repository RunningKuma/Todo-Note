<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import NoteTree from './components/NoteTree.vue';
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { noteDiffEngine } from '@/api/note/diffEngine';
import 'vditor/dist/index.css';
import { Note, NoteMeta as NoteMetaType, NoteTreeNode, NoteTreeType } from '@/api/types/note';
import { noteOps } from '@/api/note/note';
import { useToastHelper } from '@/api/utils/toast';
import { createEmptyNoteMeta } from '@/api/utils/note';
import { noteTreeTool } from '@/api/utils/noteTree';
import NoteMeta from './components/NoteMeta.vue';

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
const note = ref<Note>();
const noteTreeNodes = ref<NoteTreeNode[]>([])

// 创建计算属性来处理 v-model 绑定
const noteTitle = computed({
  get: () => note.value?.meta.title || '',
  set: (value: string) => {
    if (note.value) {
      note.value.meta.title = value;
    }
  }
});

const noteMetaProxy = computed({
  get: () => note.value?.meta || {} as NoteMetaType,
  set: (value: NoteMetaType) => {
    if (note.value) {
      note.value.meta = value;
    }
  }
});
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
    if (!note.value ||!noteDiffEngine.isInitialized) return
    noteDiffEngine.setContent(note.value.content);
  },
  { immediate: true }
);
watch(
  () => note.value?.meta.title,
  async () => {
    updateNoteTree()
  }
)

onMounted(async () => {
  if (note.value&&vditorElement.value) {
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
  const newNoteMeta: NoteMetaType = createEmptyNoteMeta(type)
  noteOps.createNote(newNoteMeta).then((res) => {
    if (res.success) {
      noteTreeNodes.value.push({
        key: newNoteMeta.id,
        label: newNoteMeta.title,
        type: type,
      } as NoteTreeNode);
      handleUpdateNoteTree()
      toast.success(`新建${type === 'folder' ? '文件夹' : '笔记'}成功`);
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to create note:', error);
  });
}
function handleDeleteNote(noteId: string) {
  noteOps.deleteNote(noteId).then((res) => {
    if (res.success) {
      noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, noteId);
      handleUpdateNoteTree()
      toast.success('笔记删除成功');
    } else {
      if (res.message === '笔记不存在') {
        noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, noteId);
      }
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to delete note:', error);
  });
}
function handleMoveNode(data: { nodeId: string, targetParentId: string | null, targetIndex: number }) {
  const { nodeId, targetParentId, targetIndex } = data;

  // 更新本地的 noteTreeNodes
  noteTreeNodes.value = noteTreeTool.moveNodeInTree(noteTreeNodes.value, nodeId, targetParentId, targetIndex);

  // 同步到后端
  handleUpdateNoteTree();

  toast.success('节点移动成功');
}
// const noteNode =
</script>
<template>
  <div class="h-full flex overflow-hidden">
    <NoteTree :note-tree-nodes="noteTreeNodes" @refresh="handleNoteTreeRefresh" @create="handleCreate"
      @delete-note="handleDeleteNote" @move-node="handleMoveNode" />
    <div class="h- flex-1">
      <!-- @todo title rename 后还需要更新树形结构艹…… -->
      <PageHeader v-model:visible="visible" v-model:note_title="noteTitle" title="Note" :actions="actions" />
      <NoteMeta v-if="note" v-model="noteMetaProxy" class="px-6 pb-1" />
      <div v-if="note" ref="vditorElement" class="h-ful border-2 border-gray-200 rounded-2xl"></div>
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-gray-500">请选择一个笔记查看内容</p>

    </div>
    </div>
  </div>
</template>