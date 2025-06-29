<template>
  <div class="todo-container p-4">
    <div class="header flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">我的任务</h1>
      <Button icon="pi pi-plus" label="添加任务" @click="showCreateDialog = true" class="bg-primary text-white" />
    </div>

    <!-- 过滤器 -->
    <div class="filters mb-4 flex gap-2">
      <Button :class="['filter-btn', currentFilter === 'all' ? 'p-button-info' : 'p-button-secondary']" label="全部"
        @click="setFilter('all')" size="small" />
      <Button :class="['filter-btn', currentFilter === 'pending' ? 'p-button-info' : 'p-button-secondary']" label="未完成"
        @click="setFilter('pending')" size="small" />
      <Button :class="['filter-btn', currentFilter === 'completed' ? 'p-button-info' : 'p-button-secondary']"
        label="已完成" @click="setFilter('completed')" size="small" />
    </div>

    <!-- TODO列表 -->
    <div class="todo-list">
      <div v-if="loading" class="text-center py-8">
        <ProgressSpinner />
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="filteredTodos.length === 0" class="text-center py-8">
        <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">暂无任务</p>
      </div>

      <div v-else class="space-y-3">
        <TodoItem v-for="todo in filteredTodos" :key="todo.id" :todo="todo" @toggle="toggleTodo" @edit="editTodo"
          @delete="deleteTodo" />
      </div>
    </div>

    <!-- 创建TODO对话框 -->
    <Dialog v-model:visible="showCreateDialog" modal header="创建新任务" class="w-96">
      <CreateTodoForm @submit="createTodo" @cancel="showCreateDialog = false" />
    </Dialog>

    <!-- 编辑TODO对话框 -->
    <Dialog v-model:visible="showEditDialog" modal header="编辑任务" class="w-96">
      <EditTodoForm v-if="editingTodo" :todo="editingTodo" @submit="updateTodo" @cancel="showEditDialog = false" />
    </Dialog>

    <!-- Toast通知 -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button, Dialog, ProgressSpinner, Toast } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { todoOps } from '@/api/todo/todo';
import type { Todo } from '@/api/types/todo';
import TodoItem from './components/TodoItem.vue';
import CreateTodoForm from './components/CreateTodoForm.vue';
import EditTodoForm from './components/EditTodoForm.vue';

// 状态管理
const todos = ref<Todo[]>([]);
const loading = ref(false);
const currentFilter = ref<'all' | 'pending' | 'completed'>('all');
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingTodo = ref<Todo | null>(null);

const toast = useToast();

// 计算属性
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'pending':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
});

// 方法
const setFilter = (filter: 'all' | 'pending' | 'completed') => {
  currentFilter.value = filter;
};

const loadTodos = async () => {
  loading.value = true;
  try {
    const response = await todoOps.getTodos();
    if (response.success) {
      // 转换数据格式以兼容前端组件
      todos.value = (response.data || []).map(todo => ({
        ...todo,
        createdAt: new Date(todo.created_at),
        updatedAt: new Date(todo.updated_at),
        dueDate: todo.due_date ? new Date(todo.due_date) : undefined
      }));
    } else {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: response.message || '加载任务失败',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '网络错误，请稍后重试',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const createTodo = async (todoData: any) => {
  try {
    const response = await todoOps.createTodo(todoData);
    if (response.success && response.data) {
      // 转换数据格式
      const newTodo = {
        ...response.data,
        createdAt: new Date(response.data.created_at),
        updatedAt: new Date(response.data.updated_at),
        dueDate: response.data.due_date ? new Date(response.data.due_date) : undefined
      };
      todos.value.unshift(newTodo);
      showCreateDialog.value = false;
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '任务创建成功',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: response.message || '创建任务失败',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '网络错误，请稍后重试',
      life: 3000
    });
  }
};

const toggleTodo = async (todo: Todo) => {
  try {
    const response = await todoOps.toggleTodo(todo.id, !todo.completed);
    if (response.success && response.data) {
      const index = todos.value.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        // 转换数据格式
        todos.value[index] = {
          ...response.data,
          createdAt: new Date(response.data.created_at),
          updatedAt: new Date(response.data.updated_at),
          dueDate: response.data.due_date ? new Date(response.data.due_date) : undefined
        };
      }
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: `任务已${response.data.completed ? '完成' : '重新开启'}`,
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: response.message || '操作失败',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '网络错误，请稍后重试',
      life: 3000
    });
  }
};

const editTodo = (todo: Todo) => {
  editingTodo.value = { ...todo };
  showEditDialog.value = true;
};

const updateTodo = async (todoData: any) => {
  if (!editingTodo.value) return;

  try {
    const response = await todoOps.updateTodo(editingTodo.value.id, todoData);
    if (response.success && response.data) {
      const index = todos.value.findIndex(t => t.id === editingTodo.value!.id);
      if (index !== -1) {
        // 转换数据格式
        todos.value[index] = {
          ...response.data,
          createdAt: new Date(response.data.created_at),
          updatedAt: new Date(response.data.updated_at),
          dueDate: response.data.due_date ? new Date(response.data.due_date) : undefined
        };
      }
      showEditDialog.value = false;
      editingTodo.value = null;
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '任务更新成功',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: response.message || '更新任务失败',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '网络错误，请稍后重试',
      life: 3000
    });
  }
};

const deleteTodo = async (todo: Todo) => {
  try {
    const response = await todoOps.deleteTodo(todo.id);
    if (response.success) {
      todos.value = todos.value.filter(t => t.id !== todo.id);
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '任务删除成功',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: response.message || '删除任务失败',
        life: 3000
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '网络错误，请稍后重试',
      life: 3000
    });
  }
};

// 生命周期
onMounted(() => {
  loadTodos();
});
</script>

<style scoped>
.todo-container {
  max-width: 800px;
  margin: 0 auto;
}

.filter-btn {
  margin-right: 0.5rem;
}

.todo-list {
  min-height: 400px;
}
</style>