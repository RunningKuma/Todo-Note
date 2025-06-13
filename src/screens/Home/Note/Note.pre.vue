<script setup lang="ts">
import Vditor from 'vditor';
import { onMounted, onUnmounted, ref } from 'vue';
import 'vditor/dist/index.css';

//@todo implement I18n
// const { t } = useI18n();

const vditorRef = ref<Vditor | null>(null);

// 生成简单的哈希值
const generateHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

onMounted(() => {
  vditorRef.value = new Vditor('vditor', {
    height: 400,
    mode: 'wysiwyg',
    theme: 'classic',
    icon: 'ant',
    placeholder: '开始记录你的想法...',
    cache: {
      enable: true,
      id: 'vditor-note',
    },
    counter: {
      enable: true,
      type: 'markdown',
    },
    toolbarConfig: {
      pin: true,
      hide: false,
    },
    preview: {
      delay: 500,
      mode: 'both',
      hljs: {
        enable: true,
        lineNumber: true,
        style: 'github',
      },
    },
    upload: {
      url: '/api/upload',
      accept: 'image/*,.pdf,.doc,.docx',
      multiple: true,
      max: 10 * 1024 * 1024, // 10MB
      filename: (name: string) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const hash = generateHash(name + timestamp);
        const ext = name.split('.').pop();
        return `${name.split('.')[0]}_${timestamp}_${hash}.${ext}`;
      },
      success(editor, msg) {
        try {
          const res = JSON.parse(msg);
          if (res.data && res.data.url) {
            return res.data.url;
          }
          return '';
        } catch (e) {
          console.error('Upload response parsing error:', e);
          return '';
        }
      },
      error(msg) {
        console.error('Upload error:', msg);
      },
    },
    after: () => {
      console.log('Vditor initialized');
    },
    input: (value) => {
      //! 这里传入完整内容 @RunningKuma
      console.log('Content changed:', value);
    },
    focus: () => {
      console.log('Editor focused');
    },
    blur: () => {
      console.log('Editor blurred');
    },


  });
});

onUnmounted(() => {
  vditorRef.value?.destroy();
});

// 获取内容
const getContent = () => {
  return vditorRef.value?.getValue();
};

// 设置内容
const setContent = (content: string) => {
  vditorRef.value?.setValue(content);
};

// 插入内容
const insertContent = (content: string) => {
  vditorRef.value?.insertValue(content);
};

// 导出方法供父组件使用
defineExpose({
  getContent,
  setContent,
  insertContent,
  vditor: vditorRef,
});
</script>

<template>
  <div class="size-full">
    <div id="vditor" class="size-full"></div>
  </div>
</template>
