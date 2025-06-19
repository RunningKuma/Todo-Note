<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- 标题 -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
        任务标题 <span class="text-red-500">*</span>
      </label>
      <InputText 
        id="title"
        v-model="formData.title" 
        placeholder="请输入任务标题"
        class="w-full"
        :invalid="!!errors.title"
        required
      />
      <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
    </div>

    <!-- 描述 -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        任务描述
      </label>
      <Textarea 
        id="description"
        v-model="formData.description" 
        placeholder="请输入任务描述（可选）"
        rows="3"
        class="w-full"
      />
    </div>

    <!-- 优先级 -->
    <div>
      <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
        优先级
      </label>
      <Dropdown 
        id="priority"
        v-model="formData.priority" 
        :options="priorityOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="选择优先级"
        class="w-full"
      />
    </div>

    <!-- 截止日期 -->
    <div>
      <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
        截止日期
      </label>
      <DatePicker 
        id="dueDate"
        v-model="formData.dueDate" 
        placeholder="选择截止日期"
        class="w-full"
        dateFormat="yy-mm-dd"
        :minDate="new Date()"
      />
    </div>

    <!-- 分类 -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
        分类
      </label>
      <InputText 
        id="category"
        v-model="formData.category" 
        placeholder="请输入分类（可选）"
        class="w-full"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 pt-4">
      <Button 
        type="button"
        label="取消" 
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button 
        type="submit"
        label="创建任务" 
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { 
  Button, 
  InputText, 
  Textarea, 
  Dropdown, 
  DatePicker 
} from 'primevue';

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  category: string;
}

const emit = defineEmits<{
  submit: [data: FormData];
  cancel: [];
}>();

// 表单数据
const formData = reactive<FormData>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: null,
  category: ''
});

// 表单验证错误
const errors = reactive({
  title: ''
});

const loading = ref(false);

// 优先级选项
const priorityOptions = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
];

// 表单验证
const validateForm = () => {
  errors.title = '';
  
  if (!formData.title.trim()) {
    errors.title = '任务标题不能为空';
    return false;
  }
  
  if (formData.title.trim().length > 100) {
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
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      due_date: formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : undefined,
      category: formData.category.trim() || undefined
    };
    
    emit('submit', submitData);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
