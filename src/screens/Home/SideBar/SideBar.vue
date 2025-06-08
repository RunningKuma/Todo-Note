<script setup lang="ts">
import { Avatar, Drawer } from 'primevue';
const visible = defineModel<boolean>();

const { username } = defineProps<{ username: string }>()

const tabs: { icon: string, name: string, route: string }[] = [];
</script>

<template>
  <Drawer v-model:visible="visible" :modal="false" :dismissable="false"
    class="w-sidebar! static! px-2 py-4 flex flex-col items-center">
    <template #container="{ }"><!-- closeCallback -->
      <h2 class="text-lg text-center font-bold">Todo-Note</h2>
      <div class="mt-auto flex flex-col items-center gap-2">
        <p class="font-bold">{{ username }}</p>
        <Avatar icon="pi pi-user" size="xlarge" />
      </div>
    </template>


  </Drawer>
</template>