<template>
  <Dialog v-model:visible="visible" :header="header" modal class="w-96 px-8 py-5">
    <template #container="{ closeCallback }">
      <h2 class="text-2xl font-bold text-primary">{{ header }}</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 标题 -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            任务标题 <span class="text-red-500">*</span>
          </label>
          <InputText id="title" v-model="formData.info.title" placeholder="请输入任务标题" class="w-full"
            :invalid="!!errors.title" required />
          <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
        </div>

        <!-- 描述 -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            任务描述
          </label>
          <Textarea id="description" v-model="formData.info.description" placeholder="请输入任务描述（可选）" rows="3"
            class="w-full" />
        </div>

        <!-- 优先级 -->
        <div>
          <label for="priority" class="text-sm font-medium text-gray-700 mb-1">
            优先级
          </label>
          <Rating id="priority" v-model="formData.info.priority" :stars="5"
            class="w-fit ml-2 align-middle inline-flex! gap-3!" />
          <!-- <Dropdown id="priority" v-model="formData.info.priority" :options="priorityOptions" optionLabel="label"
            optionValue="value" placeholder="选择优先级" class="w-full" /> -->
        </div>

        <!-- 截止日期 -->
        <div>
          <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
            截止日期
          </label>
          <DatePicker id="dueDate" v-model="formData.info.ddl" showTime placeholder="选择截止日期" class="w-full"
            dateFormat="yy-mm-dd" :minDate="new Date()" />
        </div>

        <!-- 分类 -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
            分类（使用中英文逗号分隔）
          </label>
          <!-- @todo use multi select instead -->
          <InputText id="tags" v-model="tags" @value-change="handleTagsChange" placeholder="请输入标签，用逗号分隔（可选）"
            class="w-full" />
        </div>

        <!-- 笔记 -->
        <div>
          <label for="note_link" class="block text-sm font-medium text-gray-700 mb-1">
            笔记
          </label>
          <!-- <InputText id="note_link" v-model="formData.info.note_link" placeholder="输入" class="w-full" /> -->
          <MultiSelect class="w-full" v-model="selectNotes" :options="noteFullList" optionLabel="title" display="chip"
            placeholder="此 Todo 的相关笔记（可选）" filter :loading="isLoadingNotes" @change="handleSelectNoteChange" />
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2 pt-4">
          <!-- @todo fail to fix sudden close -->
          <Button type="button" label="取消" severity="secondary" @click="emit('cancel')" />
          <Button type="submit" label="保存更改" :loading="loading" />
        </div>
      </form>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  Button,
  InputText,
  Textarea,
  Dropdown,
  DatePicker,
  Dialog,
  Rating,
  MultiSelect
} from 'primevue';
import type { Todo } from '@/api/types/todo';
import { NoteList, NoteTreeNode } from '@/api/types/note';
import { noteOps } from '@/api/note/note';
import { useToastHelper } from '@/api/utils/toast';


// type FormData = Todo
// {
//   title: string;
//   description: string;
//   completed: boolean;
//   priority: 'low' | 'medium' | 'high';
//   dueDate: Date | null;
//   category: string;
// }

const { todo, header } = defineProps<{ todo: Todo, header: string }>();
const visible = defineModel<boolean>('visible', {
  default: false,
  type: Boolean
});

const emit = defineEmits<{
  submit: [todo: Todo];
  cancel: [];
}>();

const toast = useToastHelper();

// 表单数据
const formData = reactive<Todo>(todo);

// 表单验证错误
const errors = reactive({
  title: ''
});

const loading = ref(false);
const isLoadingNotes = ref(true);

// 初始化表单数据
// const initializeForm = () => {
//   formData.title = todo.info.title;
//   formData.description = todo.info.description || '';
//   // formData.completed = todo.status === 'completed';
//   formData.priority = todo.info.priority || 2;
//   formData.ddl = todo.info.ddl ? new Date(todo.info.ddl) : undefined;
//   formData.tags = todo.info.tags || [];
// };

const tags = ref<string>(formData.info.tags?.join(', ') || '');
function handleTagsChange(value: string | undefined) {
  // tags.value = value.split(/[，,]/g).map(tag => tag.trim()).filter(tag => tag);
  formData.info.tags = value?.split(/[，,]/g)
    .map(tag => tag.trim())
    .filter(tag => tag);
}

const noteFullList = ref<NoteList[]>([])
const selectNotes = ref<NoteList[]>([])

function handleSelectNoteChange() {
  formData.info.note_link = JSON.stringify(selectNotes.value)
  // console.log(formData.info.note_link)
}

// 初始化选中的笔记
function initSelectedNotes() {
  if (formData.info.note_link && noteFullList.value?.length) {
    selectNotes.value = JSON.parse(formData.info.note_link)
  }
}
//! 注意在初始值为零时也会调用，不要滥用！
// watch(
//   () => selectNotes.value,
//   () => {
//     formData.info.note_link = selectNotes.value?.map(noteList => noteList.id).join(',')
//     // console.log(selectNotes.value)
//   }, { immediate: true }
// )
// noteList.value = formData.info.note_link?.split(',').filter(l => l).map(link => { return { id } as NoteList })
function _findNote(noteTree: NoteTreeNode[]) {
  // 处理当前层级的笔记
  const notes = noteTree.filter(node => node.type === 'note')
    .map(tree => ({ id: tree.key, title: tree.label } as NoteList));

  if (notes.length > 0 && noteFullList.value) {
    noteFullList.value.push(...notes);
  }

  // 递归处理文件夹
  for (const folder of noteTree.filter(node => node.type === 'folder')) {
    if (folder.children && folder.children.length > 0) {
      _findNote(folder.children);
    }
  }
}
isLoadingNotes.value = true;
noteOps.getNoteTree().then((res) => {
  if (res.success) {
    // 初始化空数组
    noteFullList.value = [];
    // 使用递归函数查找所有笔记
    _findNote(res.data || []);
    // 初始化已选中的笔记
    initSelectedNotes();
  }
  else {
    toast.error('无法获取用户笔记列表');
  }
}).finally(() => {
  isLoadingNotes.value = false;
})

// 表单验证
const validateForm = () => {
  errors.title = '';

  if (!formData.info.title.trim()) {
    errors.title = '任务标题不能为空';
    return false;
  }

  if (formData.info.title.trim().length > 100) {
    errors.title = '任务标题不能超过100个字符';
    return false;
  }

  return true;
};


// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    emit('submit', formData);
  } finally {
    loading.value = false;
  }
};


// onMounted(() => {
//   initializeForm();
// });
</script>

<style scoped>
.space-y-4>*+* {
  margin-top: 1rem;
}
</style>
