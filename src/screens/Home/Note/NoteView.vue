<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import NoteTree from './components/NoteTree.vue';
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { noteDiffEngine } from '@/api/note/diffEngine';
import { Note, NoteMeta as NoteMetaType, NoteTreeNode, NoteTreeType, UpdateNote } from '@/api/types/note';
import { noteOps } from '@/api/note/note';
import { useToastHelper } from '@/api/utils/toast';
import { useConfirm } from 'primevue/useconfirm';
import { createEmptyNoteMeta } from '@/api/utils/note.ts';
import { noteTreeTool } from '@/api/utils/noteTree';
import { TreeNode } from 'primevue/treenode';
import NoteEdit from './components/NoteEdit.vue';
import { NoteId } from '@/api/types/gerneral';

const { _id } = defineProps<{ _id?: string }>()
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
      if (!noteId.value) {
        toast.error('还没有打开笔记呢')
        return
      }
      _setNoteById(noteId.value, true)
    }
  },
  // {
  //   label: '历史记录',
  //   icon: 'pi pi-history',
  //   onClick: () => {
  //     // @todo to implement
  //     toast.info('History not implemented yet')
  //   }
  // },
  {
    label: '导出',
    icon: 'pi pi-upload',
    onClick: () => {
      // @todo to implement
      toast.info('Export not implemented yet')
    }
  },

]
const toast = useToastHelper();
const confirm = useConfirm();


const note = ref<Note>();
const noteTreeNodes = ref<NoteTreeNode[]>([])

if (_id) {
  _setNoteById(_id)
}

const noteId = computed({
  get: () => note.value?.meta.id || '',
  set: (value: string) => {
    if (note.value) {
      note.value.meta.id = value;
    }
  }
});
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
    if (!newId) return
    noteDiffEngine.updateNoteId(newId);
    if (!note.value || !noteDiffEngine.isInitialized) return
    noteDiffEngine.setContent(note.value.content);
  },
  { immediate: true }
);
// watch(
//   () => note.value,
//   async () => {
//     updateNoteTree()
//     noteOps.updateNote(note.value!).then((res) => {
//       if (res.success) {
//         toast.success('笔记更新成功');
//       } else {
//         toast.error(res.message ?? '未知错误');
//       }
//     }).catch((error) => {
//       console.error('Failed to update note:', error);
//       toast.error('更新笔记失败');
//     });
//   }
// )
watch(
  () => noteMetaProxy,
  async () => {
    if (!note.value) return
    _updateNode({
      meta: noteMetaProxy.value,
    });
  },
  { immediate: true }
)

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
      // toast.success('笔记目录更新成功');
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to update note tree:', error);
  });
}
function handleCreate(type: NoteTreeType) {
  const newNoteMeta: NoteMetaType = createEmptyNoteMeta(type)
  if (type === 'folder') {
    const newNoteTreeNode: NoteTreeNode = {
      key: newNoteMeta.id,
      label: newNoteMeta.title,
      type: type,
    }
    noteOps.updateNoteTree([...noteTreeNodes.value, newNoteTreeNode]).then(res => {
      if (res.success) {
        toast.success('新建文件夹成功')
        noteTreeNodes.value.push(newNoteTreeNode)
      }
      else {
        toast.error('新建文件夹失败：' + res.message)
      }
    }
    )
  } else {
    noteOps.createNote(newNoteMeta).then((res) => {
      if (res.success) {
        noteTreeNodes.value.push({
          key: newNoteMeta.id,
          label: newNoteMeta.title,
          type: type,
        } as NoteTreeNode);
        handleUpdateNoteTree()
        toast.success(`新建笔记成功`);
      } else {
        toast.error(res.message ?? '未知错误');
      }
    }).catch((error) => {
      console.error('Failed to create note:', error);
    });
  }
}
// 删除单个笔记的函数
async function deleteNote(noteId: string): Promise<boolean> {
  try {
    const res = await noteOps.deleteNote(noteId);
    return res.success;
  } catch (error) {
    toast.error('Failed to delete note');
    return false;
  }
}

// 批量删除笔记的函数
async function deleteMultipleNotes(noteIds: string[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const noteId of noteIds) {
    const result = await deleteNote(noteId);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

function handleDelete(nodeId: string) {
  // 首先找到要删除的节点
  const nodeToDelete = noteTreeTool.findNodeByKey(noteTreeNodes.value, nodeId);

  if (!nodeToDelete) {
    toast.error('未找到要删除的节点');
    return;
  }

  if (nodeToDelete.type === 'folder') {
    // 如果是文件夹，需要删除其下所有笔记
    const allNoteIds = noteTreeTool.collectAllNoteIds(nodeToDelete);

    if (allNoteIds.length === 0) {
      // 空文件夹，直接删除
      noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, nodeId);
      handleUpdateNoteTree();
      toast.success('文件夹删除成功');
      return;
    }

    // 显示确认对话框
    const confirmMessage = `此文件夹包含 ${allNoteIds.length} 个笔记，删除文件夹将同时删除所有笔记。确定要继续吗？`;

    confirm.require({
      message: confirmMessage,
      header: '确认删除',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '取消',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: '确定删除',
        severity: 'danger'
      },
      accept: () => {
        // 批量删除所有笔记
        deleteMultipleNotes(allNoteIds).then(({ success, failed }) => {
          if (failed > 0) {
            toast.error(`删除失败：${failed} 个笔记删除失败，${success} 个笔记删除成功`);
          } else {
            toast.success(`文件夹删除成功，共删除 ${success} 个笔记`);
          }

          // 更新树结构（无论是否完全成功都要更新，因为可能有部分删除成功）
          noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, nodeId);
          handleUpdateNoteTree();
        }).catch((error) => {
          console.error('Failed to delete folder:', error);
          toast.error('删除文件夹时发生错误');
        });
      },
      reject: () => {
        // 用户取消了删除操作
        console.log('用户取消了删除操作');
      }
    });

  } else {
    // 如果是普通笔记，显示确认对话框
    confirm.require({
      message: `确定要删除笔记 "${nodeToDelete.label}" 吗？`,
      header: '确认删除笔记',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '取消',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: '确定删除',
        severity: 'danger'
      },
      accept: () => {
        deleteNote(nodeId).then((success) => {
          if (success) {
            noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, nodeId);
            handleUpdateNoteTree();
            toast.success('笔记删除成功');
          } else {
            // 即使删除失败，也检查是否是"笔记不存在"的情况
            noteOps.deleteNote(nodeId).then((res) => {
              if (res.message === '笔记不存在') {
                noteTreeNodes.value = noteTreeTool.removeNodeRecursively(noteTreeNodes.value, nodeId);
                handleUpdateNoteTree();
              }
              toast.error(res.message ?? '删除笔记失败');
            });
          }
        });
      },
      reject: () => {
        // 用户取消了删除操作
        console.log('用户取消了删除操作');
      }
    });
  }
}
function handleMoveNode(data: { nodeId: string, targetParentId: string | null, targetIndex: number }) {
  const { nodeId, targetParentId, targetIndex } = data;

  // 更新本地的 noteTreeNodes
  noteTreeNodes.value = noteTreeTool.moveNodeInTree(noteTreeNodes.value, nodeId, targetParentId, targetIndex);

  // 同步到后端
  handleUpdateNoteTree();

  // toast.success('节点移动成功');
}

function _setNoteById(id: NoteId, successToast: boolean = false) {
  noteOps.getNote(id).then((res) => {
    if (res.success) {
      note.value = res.data!;
      if (successToast) {
        toast.success(`笔记 ${noteId.value} 已更新`)
      }
    } else {
      toast.error(res.message ?? '未知错误');
    }
  }).catch((error) => {
    console.error('Failed to fetch note:', error);
  });
}

function _updateNode(newNode: UpdateNote) {
  noteOps.updateNote(newNode).then((res) => {
    if (res.success) {
      // 合并 meta 数据，保留现有数据并覆盖更新的字段
      note.value!.meta = {
        ...note.value!.meta,
        ...newNode.meta,
        // 确保 modified 时间更新
        modified: new Date()
      };
      if (newNode.meta.title) {
        noteTreeNodes.value = noteTreeTool.updateNode(noteTreeNodes.value, newNode.meta.id, () => ({ label: newNode.meta.title }));
        handleUpdateNoteTree();
      }
      // 如果有内容更新，则更新内容
      if (newNode.content) {
        note.value!.content = newNode.content;
        // 同步更新编辑器内容
        if (noteDiffEngine.isInitialized) {
          noteDiffEngine.setContent(newNode.content);
        }
      }
    } else {
      toast.error(res.message ?? '更新笔记标题失败');
    }
  }).catch((error) => {
    console.error('Failed to update note meta:', error);
  });
}

function handleNoteSelect(node: TreeNode) {
  console.log('Selected node:', node);
  if (node.type === 'note') {
    _setNoteById(node.key)
  }
}
function handleRenameNode(data: { nodeId: string, newName: string }) {
  const { nodeId, newName } = data;
  const node = noteTreeTool.findNodeByKey(noteTreeNodes.value, nodeId);
  if (node) {
    if (node.type === 'folder') {
      node.label = newName;
      handleUpdateNoteTree();
    }
    else if (node.type === 'note') {
      // 更新笔记标题
      _updateNode({
        meta: {
          id: nodeId,
          title: newName,
          modified: new Date() // 更新修改时间
        },
      });
    }
  } else {
    toast.error('未找到要重命名的节点');
  }
}
function handlePageHeaderUpdateTitle() {
  if (note.value) {
    _updateNode({
      meta: {
        id: note.value.meta.id,
        title: noteTitle.value,
        modified: new Date() // 更新修改时间
      },
    });
  }
}

</script>
<template>
  <div class="h-full flex">
    <NoteTree :note-tree-nodes="noteTreeNodes" @refresh="handleNoteTreeRefresh" @create="handleCreate"
      @delete-note="handleDelete" @move-node="handleMoveNode" @select="handleNoteSelect"
      @rename-node="handleRenameNode" />
    <div class="h-[calc(100vh-32px)] max-w-full flex-1 flex flex-col">
      <!-- @dtodo title rename 后还需要更新树形结构艹…… -->
      <PageHeader v-model:visible="visible" v-model:note_title="noteTitle" title="Note" :actions="actions"
        @update-title="handlePageHeaderUpdateTitle" />
      <!-- <RouterView/> -->
      <NoteEdit :note="note" v-model="noteMetaProxy"></NoteEdit>
    </div>
  </div>
</template>