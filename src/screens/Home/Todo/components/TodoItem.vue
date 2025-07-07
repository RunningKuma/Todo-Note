<script setup lang="ts">
import { Todo } from '@/api/types/todo';
import { handle } from '@primeuix/themes/aura/imagecompare';
import { Button, Checkbox, Rating } from 'primevue';
import { computed, ref } from 'vue';

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
</script>

<template>
  <div class="w-full h-15 px-5 py-2.5 flex items-center gap-2.5">
    <Checkbox class="" :default-value="completed" binary @value-change="() => emit('toggle', todo)" />
    <h3 class="text-xl font-bold">{{ todo.info.title }}</h3>
    <div class="text-xs flex flex-col gap-1">
      <Rating v-model="todo.info.priority" class="w-20" :stars="5" readonly />
      <div>
        <i class="pi pi-clock align-middle"></i><span class="ml-0.5">{{ todo.info.ddl?.toLocaleString() }}</span>
      </div>
    </div>
    <div class="">
      <i class="pi pi-tag align-middle"></i>
      <span class="ml-0.5">{{ todo.info.tags?.join(', ') }}</span>
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