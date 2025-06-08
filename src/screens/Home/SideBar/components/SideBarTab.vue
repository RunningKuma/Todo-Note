<script setup lang="ts">
import router from '@/router';
import { Button } from 'primevue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

export interface SideBarTabInterface {
  name: string,
  icon: string,
  route: RouteLocationRaw,
}
interface _SidebarTabProps extends SideBarTabInterface {
  isCurrent: boolean
}
const { name, icon, route, isCurrent } = defineProps<_SidebarTabProps>();
</script>
<template>
  <RouterLink variant="text" size="small" class="block relative place-items-center w-full! h-sidebar-tabh p-1.5 z-10"
    :name="name" :icon="icon" :to="route">
    <i :class="[icon, isCurrent ? 'text-white!' : '', 'w-full h-fit text-lg text-center']" />
  </RouterLink>
</template>