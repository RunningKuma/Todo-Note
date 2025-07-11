<script setup lang="ts">
import { NoteList } from '@/api/types/note';
import { Chip } from 'primevue';

const { list } = defineProps<{ list: NoteList }>()
</script>
<template>
  <span class="ml-0.5" @click="">
    <Chip :label="list.title" class="w-auto! h-7! p-2! truncate! text-ellipsis! overflow-hidden!" />
  </span>
</template>