<script setup lang="ts">
import { NoteList } from '@/api/types/note';
import { Todo } from '@/api/types/todo';
import { handle } from '@primeuix/themes/aura/imagecompare';
import { Button, Checkbox, Rating } from 'primevue';
import { computed, ref } from 'vue';
import NoteTag from './NoteTag.vue';

const { todo } = defineProps<{ todo: Todo }>()

const emit = defineEmits<{
  toggle: [todo: Todo];
  edit: [todo: Todo];
  delete: [todo: Todo];
}>();

const completed = computed(() => todo.status.completed === 'completed');

const deleteConfirm = ref(false);
let deleteTimeout: ReturnType<typeof setTimeout> | null = null;
function handleDelete() {
  if (deleteConfirm.value) {
    emit('delete', todo);
    deleteConfirm.value = false;
    if (deleteTimeout)
      clearTimeout(deleteTimeout);
  } else {
    deleteConfirm.value = true;
    deleteTimeout = setTimeout(() => {
      deleteConfirm.value = false;
    }, 2000);
  }
}

const MAX_NOTE_TAGS = 3
const noteDisplay = computed<NoteList[] | undefined>(() => JSON.parse(todo.info.note_link ?? '{}'))
const noteTagsToShow = computed(() => {
  if (noteDisplay.value instanceof Array) {
    return noteDisplay.value.slice(0, MAX_NOTE_TAGS)
  }
  return []
})
const noteTagsOverflow = computed(() => {
  if (noteDisplay.value instanceof Array) {
    return noteDisplay.value.length - MAX_NOTE_TAGS
  }
  return 0
})
// console.log(noteDisplay.value)
</script>

<template>
  <div class="w-full px-5 py-2.5 flex items-center gap-2.5 overflow-hidden">
    <Checkbox class="" :default-value="completed" binary @value-change="() => emit('toggle', todo)" />
    <div class="w-full flex flex-col flex-1 overflow-hidden">
      <div class="flex gap-2.5 overflow-hidden">
        <h3 :class="['todo-title overflow-hidden text-ellipsis', completed ? 'completed text-gray-400' : '', ' text-xl font-bold']">
          {{ todo.info.title }}
        </h3>
        <Rating :class="[completed ? '**:text-gray-400!' : '']" v-model="todo.info.priority" :stars="5" readonly />
      </div>
      <div class="flex gap-2.5 overflow-hidden text-md">
        <div v-if="todo.info.ddl" class="flex items-center">
          <i class="pi pi-clock align-middle"></i><span class="ml-0.5 leading-">{{ todo.info.ddl.toLocaleString() }}</span>
        </div>
        <div v-if="todo.info.tags" class="flex items-center">
          <i class="pi pi-tag align-middle"></i>
          <span class="ml-0.5">{{ todo.info.tags.join(', ') }}</span>
        </div>
        <div v-if="noteDisplay instanceof Array" class="flex-1 flex items-center gap-1 overflow-hidden">
          <NoteTag :list="note" v-for="note in noteTagsToShow" :key="note.id" />
          <span v-if="noteTagsOverflow > 0" class="note-overflow">+{{ noteTagsOverflow }}</span>
        </div>
      </div>
    </div>
    <div class="ml-auto">
      <Button class="" size="small" icon="pi pi-pencil" variant="text" severity="secondary"
        @click="emit('edit', todo)" />
      <Button class="" size="small" :variant="deleteConfirm ? '' : 'text'"
        :severity="deleteConfirm ? 'danger' : 'secondary'" @click="handleDelete">
        <i class="pi pi-trash"></i>
        <span
          :class="'text-white text-xs text-nowrap inline-block overflow-hidden transition-all duration-300 ' + (deleteConfirm ? 'w-17' : 'size-0')">确定删除吗？</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.todo-title {
  position: relative;
  display: inline-block;
}

.todo-title.completed::before {
  content: '';
  position: absolute;
  left: -5px;
  top: calc(50%);
  width: calc(100% + 10px);
  height: 2px;
  background: #000 60%;
  /* transform: translateY(-50%); */
  pointer-events: none;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }

  to {
    width: calc(100% + 10px);
    opacity: 1;
  }
}
</style>