<script setup lang="ts">
import { Note } from '@/api/types/note';
import TimeDisplay from '@/components/TimeDisplay.vue';
import { useRouter } from 'vue-router';

defineProps<{
  note: Note
}>()

const router = useRouter()

</script>

<template>
  <div class="min-w-38) h-43 bg-primary-200 rounded-lg p-2 shadow-md flex-1 flex flex-col" :id="note.meta.id">
    <h2 class="h-fit font-bold line-clamp-1 text-lg overflow-hidden text-ellipsis">{{ note.meta.title }}</h2>
    <div class="text-gray-500 text-sm">
      <i class="pi pi-clock pr-1.5 before:text-sm"></i>
      <TimeDisplay :time="note.meta.modified"></TimeDisplay>
    </div>
    <div class=" relative flex-1 mt-2 rounded-lg overflow-hidden"
      @click="router.push({ name: 'note_detail', params: { _id: note.meta.id } })">
      <p class="size-full text-ellipsis line-clamp-4 bg-amber-100 pl-2 border-l-6 border-amber-300">
        {{ note.content.substring(0, 100) }}
      </p>
      <div
        class="size-full absolute left-0 top-0 bg-gray-500/20 backdrop-blur-xs z-10 opacity-0 hover:opacity-100 transition-all duration-300">
        <p class=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          查看更多
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>