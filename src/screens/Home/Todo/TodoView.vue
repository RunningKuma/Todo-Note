<script setup lang="ts">
import PageHeader, { PageHeaderAction } from '@/components/PageHeader.vue';
import { testTodo } from '@/api/constants/test';
import { Button, DataView, Dialog, FloatLabel, IconField, InputIcon, InputText, Select, Toast } from 'primevue';
import { Todo, TodoCreateData, TodoStatus } from '@/api/types/todo';
import { computed, ref } from 'vue';
import TodoItem from './components/TodoItem.vue';
// import EditTodoForm from './components/EditTodoForm.vue';
import TodoDialog from './components/TodoDialog.vue';
import { createEmptyTodo } from '@/api/utils/todo';
import { todoOps } from '@/api/todo/todo';
import { TodoId } from '@/api/types/gerneral';
import { useToastHelper } from '@/api/utils/toast';
//! ref: https://www.cssscript.com/liquid-glass-web/
import { LiquidWeb } from 'liquid-web/vue';

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

// logic

const toast = useToastHelper()
const todos = ref<Todo[]>([]);
todoOps.getTodos().then(res => {
  if (res.success) {
    todos.value = res.data!;
  }
  else {
    throw new Error(res.message || '获取待办列表失败');
  }
}).catch(err => {
  toast.error(err.message || '未知错误', '获取待办列表失败');
});
// 筛选功能
// @todo 下方筛选无效暂时屏蔽 to implement
let fliterTodos = computed(() => todos.value.filter(todo => todo.info.title.includes(searchKey.value))
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


let dialogAction: 'create' | 'update' | undefined;
const dialogTodo = ref<Todo | null>(null);
const showDialog = ref(false);
// 处理对话框的显示和隐藏
function handleTodoDialogToggle(visible: boolean, todo?: Todo) {
  showDialog.value = visible;
  // 关闭时清空对话框内容
  if (!visible) {
    dialogAction = undefined;
    dialogTodo.value = null;
  }
  // 传入则为编辑，设置为当前编辑的 todo
  else if (todo) {
    dialogAction = 'update';
    // 深拷贝 todo
    dialogTodo.value = JSON.parse(JSON.stringify(todo));
  }
  // 不传入则为新建，创建一个新的 Todo
  else {
    dialogAction = 'create';
    dialogTodo.value = createEmptyTodo();
  }
}
function handleCreateTodo(todo: Todo) {
  // @todo to implement
  // return
  todoOps.createTodo(todo).then(res => {
    if (res.success) {
      todos.value.push(todo);
      handleTodoDialogToggle(false);
      toast.success('创建成功');
      console.log('Todo created successfully:', res.data);
    }
    else {
      toast.error(res.message || '创建失败，未知错误');
    }
  })
}
function handleUpdateTodo(todo: Todo) {
  // @todo to implement
  // return
  todoOps.updateTodo(todo).then(res => {
    if (res.success) {
      todos.value = todos.value.map(t => t.info.id === todo.info.id ? todo : t);
      handleTodoDialogToggle(false);
      toast.success('更新成功');
      console.log('Todo updated successfully:', res.data);
    }
    else {
      toast.error(res.message || '更新失败，未知错误');
    }
  })
}
function handleToggleTodo(todo: Todo) {
  // @todo to implement
  // return
  todoOps.toggleTodo(todo.info.id, todo.status.completed === 'completed' ? false : true)
    .then(res => {
      if (res.success) {
        todo.status.completed = todo.status.completed === 'completed' ? 'not-started' : 'completed';
      }
      else {
        toast.error(res.message || '切换失败，未知错误');
      }
    })
}
function handleDeleteTodo(id: TodoId) {
  // @todo to implement
  // return
  todoOps.deleteTodo(id).then(res => {
    if (res.success) {
      todos.value = todos.value.filter(todo => todo.info.id !== id);
      toast.success('Todo 已删除');
    }
  })
}
</script>
<template>
  <div class="h-full flex flex-col">
    <PageHeader v-model="visible" title="Todo" :actions="actions" />
    <LiquidWeb class="fixed! right-12 bottom-12 z-50" :options="{ scale: 30, blur: 1, aberration: 100 }" selector="div">
      <Button id="addBtn"
        :class="showDialog ? 'opacity-0 pointer-events-none' : 'bg-primary/50! opacity-100' + ' btn-scale transition-all! duration-300!'"
        size="large" icon="pi pi-plus" rounded @click="handleTodoDialogToggle(true)" />
    </LiquidWeb>
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
          <TodoItem :todo="todo" v-for="todo in (items as Todo[])" :key="todo.info.id"
            @edit="handleTodoDialogToggle(true, todo)" @toggle="handleToggleTodo(todo)"
            @delete="handleDeleteTodo(todo.info.id)" />
        </div>
      </template>
    </DataView>
    <TodoDialog v-model:visible="showDialog" v-if="dialogTodo" :todo="dialogTodo" header="Todo" @submit="(todo) => {
      if (dialogAction === 'create') {
        handleCreateTodo(todo);
      } else if (dialogAction === 'update') {
        handleUpdateTodo(todo);
      }
    }" @cancel="handleTodoDialogToggle(false)" />
  </div>
</template>