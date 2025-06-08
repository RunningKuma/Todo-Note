<script setup lang="ts">
import router from '@/router';
import { Button } from 'primevue';
import { RouteLocationRaw } from 'vue-router';

export interface SideBarTabInterface {
  name: string,
  icon: string,
  route: RouteLocationRaw,
}
const { name, icon, route } = defineProps<SideBarTabInterface>();
</script>
<template>
  <Button variant="text" size="small" class="block! w-full!" :name="name" :icon="icon"
    @click="router.push(route)"></Button>
</template>