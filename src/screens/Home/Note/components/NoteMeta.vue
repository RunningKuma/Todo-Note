<script setup lang="ts">
import { NoteMeta } from '@/api/types/note';

const noteMeta = defineProps<NoteMeta>();
</script>
<template>
  <div>
    <h2 class="text-lg font-semibold">笔记信息</h2>
    <div class="mt-2">
      <p><strong>创建时间:</strong> {{ noteMeta.create }}</p>
      <p><strong>更新时间:</strong> {{ noteMeta.modified }}</p>
    </div>
  </div>
</template>