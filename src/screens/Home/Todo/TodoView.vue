<script setup lang="ts">
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { testTodo } from '@/api/constants/test';
import { DataView, FloatLabel, IconField, InputIcon, InputText, Select } from 'primevue';
import { Todo, TodoStatus } from '@/api/types/todo';
import { computed, ref } from 'vue';
import TodoItem from './components/TodoItem.vue';

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
  {
    label: '创建',
    icon: 'pi pi-plus',
    onClick: () => {
      // @todo to implement
    }
  }
]

// filter options
type FliterOption<T> = {
  label: string;
  value: T;
}
type FliterOptions<T> = FliterOption<T>[];
type TodoStatusWithAll = TodoStatus['completed'] | 'all';
type DdlFliter = 'all' | 'today' | 'tomorrow' | 'day_3' | 'week_1' | 'week_2' | 'month_1' | 'year_1';
const statusFliter = ref<FliterOption<TodoStatusWithAll>>({ label: '全部', value: 'all' });
const statusFliterOptions: FliterOptions<TodoStatusWithAll> = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  // { label: '进行中', value: 'in-progress' },
  { label: '未开始', value: 'not-started' },
  // { label: '暂缓', value: 'pending' },
];
const priorityFliter = ref<FliterOption<number>>({ label: '全部', value: -1 });
const priorityFliterOptions: FliterOptions<number> = [
  { label: '全部', value: -1 },
  { label: '极高', value: 5 },
  { label: '高', value: 4 },
  { label: '中', value: 3 },
  { label: '较低', value: 2 },
  { label: '低', value: 1 },
];
const ddlFliter = ref<FliterOption<DdlFliter>>({ label: '全部', value: 'all' });
const ddlFliterOptions: FliterOptions<DdlFliter> = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '明天', value: 'tomorrow' },
  { label: '3天内', value: 'day_3' },
  { label: '一周内', value: 'week_1' },
  { label: '两周内', value: 'week_2' },
  { label: '一个月内', value: 'month_1' },
  { label: '一年内', value: 'year_1' },
];
const searchKey = ref<string>('');

// 筛选功能
let todos = testTodo
// @todo 下方筛选无效暂时屏蔽 to implement
let fliterTodos = computed(() => todos.filter(todo => todo.info.title.includes(searchKey.value))
  .filter(todo => {
    if (statusFliter.value.value === 'all') return true;
    if (todo.status.completed === undefined) return false; // 如果没有设置状态，则不显示
    return todo.status.completed === statusFliter.value.value;
  })
  .filter(todo => {
    if (priorityFliter.value.value === -1) return true; // -1 显示全部
    if (todo.info.priority === undefined) return false; // 如果没有设置优先级，则不显示
    return todo.info.priority === priorityFliter.value.value;
  })
  .filter(todo => {
    if (ddlFliter.value.value === 'all') return true;
    if (todo.info.ddl === undefined) return false; // 如果没有设置截止日期，则不显示
    const dueDate = new Date(todo.info.ddl);
    const now = new Date();
    switch (ddlFliter.value.value) {
      case 'today':
        return dueDate.toDateString() === now.toDateString();
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        return dueDate.toDateString() === tomorrow.toDateString();
      case 'day_3':
        const day3 = new Date();
        day3.setDate(now.getDate() + 3);
        return dueDate <= day3;
      case 'week_1':
        const week1 = new Date();
        week1.setDate(now.getDate() + 7);
        return dueDate <= week1;
      case 'week_2':
        const week2 = new Date();
        week2.setDate(now.getDate() + 14);
        return dueDate <= week2;
      case 'month_1':
        const month1 = new Date();
        month1.setMonth(now.getMonth() + 1);
        return dueDate <= month1;
      case 'year_1':
        const year1 = new Date();
        year1.setFullYear(now.getFullYear() + 1);
        return dueDate <= year1;
    }
    return false;
  }));
</script>
<template>
  <div class="h-full flex flex-col">
    <PageHeader v-model="visible" title="Todo" :actions="actions" />
    <DataView :value="fliterTodos" class="h-full relative overflow-y-auto flex flex-col" lazy>
      <template #header>
        <!-- @todo sticky header -->
        <div class="w-full h-10 flex items-center gap-2.5">
          <!-- @todo use components -->
          <i class="text-xl! pi pi-check-circle "></i>
          <Select class="h-8" size="small" v-model="statusFliter" :options="statusFliterOptions" optionLabel="label"
            placeholder="完成情况" />
          <i class="text-xl! pi pi-exclamation-triangle "></i>
          <Select class="h-8" size="small" v-model="priorityFliter" :options="priorityFliterOptions" optionLabel="label"
            placeholder="优先级" />
          <i class="text-xl! pi pi-clock"></i>
          <Select class="h-8" size="small" v-model="ddlFliter" :options="ddlFliterOptions" optionLabel="label"
            placeholder="ddl" />

          <FloatLabel class="ml-auto" variant="on">
            <IconField>
              <InputText id="searchInput" class="h-8" size="small" v-model="searchKey" />
              <InputIcon class="pi pi-search " />
            </IconField>
            <label for="searchInput">搜索</label>
          </FloatLabel>
        </div>
      </template>
      <template #list="{ items }">
        <div class="flex flex-col">
          <TodoItem :todo="todo" v-for="todo in (items as Todo[])" :key="todo.info.id" />
        </div>
      </template>
    </DataView>
  </div>
</template>