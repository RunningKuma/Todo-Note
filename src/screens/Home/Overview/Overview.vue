<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { DatePicker, Divider } from 'primevue';
import { ref } from 'vue';
import NoteBlock from './components/NoteBlock.vue';
import { todoOps } from '@/api/todo/todo';
import { Todo } from '@/api/types/todo';
import TodoBrief from './components/TodoBrief.vue';

const visible = defineModel<boolean>({
  default: true,
  type: Boolean
});

const date = ref<Date | null>(null);
const todos = ref<Todo[]>([]);

todoOps.getTodos().then(res => {
  if (res.success) {
    todos.value = res.data ?? [];
  }
});

</script>

<template>
  <PageHeader v-model:visible="visible" title="Dashboard" :actions="[]"/>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
    <div class="overflow-hidden col-span-2 order-2">
      <h1 class="text-2xl font-bold mb-4">最近的笔记</h1>
      <div class="grid gap-2 mb-4 grid-cols-3 xl:grid-cols-4">
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
        <NoteBlock title="标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题标题" :time="date" id="id"></NoteBlock>
      </div>
      <h1 class="text-2xl font-bold mb-4">最近的待办</h1>
      <div class="w-full overflow-hidden flex flex-col">
        <TodoBrief v-for="todo in todos" :key="todo.info.id" :todo="todo"></TodoBrief>
        <Divider />
      </div>
    </div>
    <div class="col-span-1 order-1 lg:order-3">
      <h1 class="text-2xl font-bold mb-4">日历</h1>
      <DatePicker v-model="date" inline class="w-full" />

    </div>
  </div>
</template>

<style scoped>
/* .overview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
} */
</style>