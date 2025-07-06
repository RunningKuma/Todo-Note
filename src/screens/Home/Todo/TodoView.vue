<script setup lang="ts">
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { testTodo } from '@/api/constants/test';
import { DataView, FloatLabel, InputIcon, InputText, Select } from 'primevue';
import { TodoStatus } from '@/api/types/todo';
import { ref } from 'vue';

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

type FliterOptions<T> = {
  label: string;
  value: T;
}[]
type TodoStatusWithAll = TodoStatus['completed'] | 'all';
type DdlFliter = 'all' | 'today' | 'tomorrow' | 'day_3' | 'week_1' | 'week_2' | 'month_1' | 'year_1';
const priorityFliter = ref<TodoStatusWithAll>('all');
const priorityFliterOptions: FliterOptions<TodoStatusWithAll> = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '进行中', value: 'in-progress' },
  { label: '未开始', value: 'not-started' },
  { label: '暂缓', value: 'pending' },
];
const ddlFliter = ref<DdlFliter>('all');
const ddlFliterOptions: FliterOptions<DdlFliter> = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '明天', value: 'tomorrow' },
  { label: '3天内', value: 'day_3' },
  { label: '本周', value: 'week_1' },
  { label: '两周内', value: 'week_2' },
  { label: '本月', value: 'month_1' },
  { label: '本年', value: 'year_1' },
];
const searchKey = ref<string>('');

const todos = testTodo
</script>
<template>
  <PageHeader v-model="visible" title="Todo" :actions="actions" />
  <DataView :value="todos">
    <template #header>
      <div class="w-full h-10 flex items-center gap-2.5">
        <i class="text-xl! pi pi-exclamation-triangle "></i>
        <Select class="h-8" size="small" v-model="priorityFliter" :options="priorityFliterOptions" optionLabel="label"
          placeholder="优先级" />
        <i class="text-xl! pi pi-clock"></i>
        <Select class="h-8" size="small" v-model="ddlFliter" :options="ddlFliterOptions" optionLabel="label"
          placeholder="ddl" />

        <FloatLabel class="ml-auto" variant="on">
          <label for="searchInput">搜索</label>
          <IconField>
            <InputText id="searchInput" class="h-8" size="small" v-model="searchKey" />
            <!-- 😡 -->
            <InputIcon class="pi pi-search relative right-6" />
          </IconField>
        </FloatLabel>
      </div>
    </template>
    <template #list="slotProps">
      <div v-for="todo in slotProps.items" :key="todo.info.id">
        {{ todo.info.title }}
      </div>
    </template>
  </DataView>
</template>