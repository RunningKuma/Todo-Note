<script setup lang="ts">
import { Divider, Rating } from 'primevue';
import { Todo } from '@/api/types/todo';
import TimeDisplay from '@/components/TimeDisplay.vue';

const { todo } = defineProps<{ todo: Todo }>()

const emit = defineEmits<{
  toggle: [todo: Todo];
  edit: [todo: Todo];
  delete: [todo: Todo];
}>();
</script>

<template>
  <Divider />
  <div class="w-full flex overflow-hidden items-center">
    <div class="w-24">
      <div v-if="todo.info.ddl !== undefined" class="text-right">
        <TimeDisplay :time="todo.info.ddl"></TimeDisplay>
        <span class="m-2">·</span>
      </div>
    </div>
    <Rating v-model="todo.info.priority" :stars="5" readonly />
    <span class="m-2">·</span>
    <div class="flex-1 overflow-hidden text-ellipsis font-bold">
      {{ todo.info.title }}
    </div>
  </div>
</template>

<style>

</style>