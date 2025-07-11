<script setup lang="ts">
import TimeDisplay from '@/components/TimeDisplay.vue';

defineProps<{
  title: string
  time: Date
  id: string
}>()
</script>

<template>
  <div class="min-w-38 h-40 bg-primary-200 rounded-lg p-2 shadow-md flex-1" :id="id">
    <div class="text-gray-500 flex items-center gap-1.5">
      <i class="pi pi-clock"></i>
      <TimeDisplay :time="time"></TimeDisplay>
    </div>
    <h2 class="font-bold line-clamp-3 text-lg">{{ title }}</h2>
  </div>
</template>

<style scoped>

</style>