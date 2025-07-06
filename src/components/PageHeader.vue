<script setup lang="ts">
import DrawerTrigger from '@/screens/Home/SideBar/DrawerTrigger.vue';
import Time from '@/components/time.vue';
import { Button } from 'primevue';

const visible = defineModel<boolean>({
  default: true,
  type: Boolean
});

export type PageHeaderAction = {
  label: string;
  icon?: string;
  onClick: () => void;
}
const props = defineProps<{
  title: string;
  note_title?: string;
  actions: PageHeaderAction[];
}>();
</script>

<template>
  <div class="w-full h-9 flex items-center gap-2.5">
    <DrawerTrigger class="-mr-2.5" v-model="visible" />
    <h2 class="text-2xl text-primary font-semibold">{{ props.title }}</h2>
    <Button class="size-6 btn-scale transition-all! duration-300!" severity="secondary" variant="outlined" rounded
      v-for="action in props.actions" :key="action.label" @click="action.onClick">
      <i :class="action.icon"></i>
    </Button>
    <Time class="ml-auto" />
  </div>
</template>