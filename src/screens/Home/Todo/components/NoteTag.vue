<script setup lang="ts">
import { NoteId } from '@/api/types/gerneral';
import { NoteList } from '@/api/types/note';
import { Chip } from 'primevue';
import { useRouter } from 'vue-router';

defineProps<{ list: NoteList }>()

const router = useRouter()
</script>
<template>
  <span class="ml-0.5" @click="router.push({ name: 'note_detail', params: { _id: list.id } })">
    <Chip :label="list.title" class="w-auto! h-7! p-2! truncate! text-ellipsis! overflow-hidden!" />
  </span>
</template>