<template>
  <div class="todo-item p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
    <div class="flex items-start gap-3">
      <!-- 完成状态复选框 -->
      <Checkbox 
        v-model="todo.completed" 
        :binary="true"
        @change="$emit('toggle', todo)"
        class="mt-1"
      />
      
      <!-- 任务内容 -->
      <div class="flex-1 min-w-0">
        <h3 
          :class="[
            'text-lg font-medium',
            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
          ]"
        >
          {{ todo.title }}
        </h3>
        
        <p 
          v-if="todo.description" 
          :class="[
            'text-sm mt-1',
            todo.completed ? 'text-gray-400' : 'text-gray-600'
          ]"
        >
          {{ todo.description }}
        </p>
        
        <!-- 元数据 -->
        <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <!-- 优先级 -->
          <Tag 
            v-if="todo.priority"
            :value="priorityLabels[todo.priority]"
            :severity="getPrioritySeverity(todo.priority)"
            class="text-xs"
          />
          
          <!-- 截止日期 -->
          <span v-if="todo.dueDate" class="flex items-center gap-1">
            <i class="pi pi-calendar"></i>
            {{ formatDate(todo.dueDate) }}
          </span>
            <!-- 分类 -->
          <span v-if="todo.category" class="flex items-center gap-1">
            <i class="pi pi-tag"></i>
            {{ todo.category }}
          </span>
          
          <!-- 创建时间 -->
          <span class="flex items-center gap-1">
            <i class="pi pi-clock"></i>
            {{ formatDate(todo.createdAt) }}
          </span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          text 
          rounded
          size="small"
          @click="$emit('edit', todo)"
          class="text-gray-600 hover:text-blue-600"
        />
        <Button 
          icon="pi pi-trash" 
          text 
          rounded
          size="small"
          @click="$emit('delete', todo)"
          class="text-gray-600 hover:text-red-600"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button, Checkbox, Tag } from 'primevue';
import type { Todo } from '@/api/types/todo';

interface Props {
  todo: Todo;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [todo: Todo];
  edit: [todo: Todo];
  delete: [todo: Todo];
}>();

// 优先级标签映射
const priorityLabels = {
  low: '低优先级',
  medium: '中优先级',
  high: '高优先级'
};

// 获取优先级颜色
const getPrioritySeverity = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'secondary';
  }
};

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.todo-item {
  transition: all 0.2s ease-in-out;
}

.todo-item:hover {
  transform: translateY(-1px);
}
</style>
