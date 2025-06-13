<template>
  <div class="simple-todo-test p-6">
    <h1 class="text-2xl font-bold mb-4">TODO 模块测试</h1>
    
    <div class="mb-4">
      <input 
        v-model="newTodoTitle" 
        @keyup.enter="createSimpleTodo"
        placeholder="输入新任务标题..."
        class="border p-2 w-64 mr-2"
      />
      <button 
        @click="createSimpleTodo"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        添加任务
      </button>
    </div>

    <div class="mb-4">
      <button 
        @click="loadTodos"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
      >
        刷新任务列表
      </button>
      <span v-if="loading" class="text-blue-500">加载中...</span>
    </div>

    <div v-if="message" class="mb-4 p-3 rounded" :class="messageClass">
      {{ message }}
    </div>

    <div class="todo-list">
      <div v-if="todos.length === 0" class="text-gray-500 italic">
        暂无任务
      </div>
      <div v-else>
        <div v-for="todo in todos" :key="todo.id" class="todo-item border p-3 mb-2 rounded flex items-center justify-between">
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              :checked="todo.completed"
              @change="toggleTodo(todo)"
              class="w-4 h-4"
            />
            <span :class="{ 'line-through text-gray-500': todo.completed }">
              {{ todo.title }}
            </span>
            <span v-if="todo.priority" class="text-xs px-2 py-1 rounded" :class="getPriorityClass(todo.priority)">
              {{ todo.priority }}
            </span>
          </div>
          <button 
            @click="deleteTodo(todo)"
            class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { todoOps } from '@/api/todo';

const todos = ref<any[]>([]);
const loading = ref(false);
const newTodoTitle = ref('');
const message = ref('');
const messageClass = ref('');

const showMessage = (msg: string, isError = false) => {
  message.value = msg;
  messageClass.value = isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300';
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const loadTodos = async () => {
  loading.value = true;
  try {
    const response = await todoOps.getTodos();
    console.log('TODO响应:', response);
    
    if (response.success) {
      todos.value = response.data || [];
      showMessage(`成功加载 ${todos.value.length} 个任务`);
    } else {
      showMessage(response.message || '加载任务失败', true);
    }
  } catch (error) {
    console.error('加载TODO失败:', error);
    showMessage('网络错误，请检查服务器连接', true);
  } finally {
    loading.value = false;
  }
};

const createSimpleTodo = async () => {
  if (!newTodoTitle.value.trim()) {
    showMessage('请输入任务标题', true);
    return;
  }

  try {
    const response = await todoOps.createTodo({
      title: newTodoTitle.value.trim(),
      priority: 'medium'
    });
    
    console.log('创建TODO响应:', response);
    
    if (response.success && response.data) {
      todos.value.unshift(response.data);
      newTodoTitle.value = '';
      showMessage('任务创建成功');
    } else {
      showMessage(response.message || '创建任务失败', true);
    }
  } catch (error) {
    console.error('创建TODO失败:', error);
    showMessage('网络错误，请检查服务器连接', true);
  }
};

const toggleTodo = async (todo: any) => {
  try {
    const response = await todoOps.toggleTodo(todo.id);
    console.log('切换TODO响应:', response);
    
    if (response.success && response.data) {
      const index = todos.value.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        todos.value[index] = response.data;
      }
      showMessage(`任务已${response.data.completed ? '完成' : '重新开启'}`);
    } else {
      showMessage(response.message || '操作失败', true);
    }
  } catch (error) {
    console.error('切换TODO失败:', error);
    showMessage('网络错误，请检查服务器连接', true);
  }
};

const deleteTodo = async (todo: any) => {
  if (!confirm('确定要删除这个任务吗？')) {
    return;
  }

  try {
    const response = await todoOps.deleteTodo(todo.id);
    console.log('删除TODO响应:', response);
    
    if (response.success) {
      todos.value = todos.value.filter(t => t.id !== todo.id);
      showMessage('任务删除成功');
    } else {
      showMessage(response.message || '删除任务失败', true);
    }
  } catch (error) {
    console.error('删除TODO失败:', error);
    showMessage('网络错误，请检查服务器连接', true);
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-200 text-red-800';
    case 'medium':
      return 'bg-yellow-200 text-yellow-800';
    case 'low':
      return 'bg-green-200 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

onMounted(() => {
  loadTodos();
});
</script>

<style scoped>
.simple-todo-test {
  max-width: 600px;
  margin: 0 auto;
}

.todo-item {
  transition: all 0.2s ease-in-out;
}

.todo-item:hover {
  background-color: #f9fafb;
}
</style>
