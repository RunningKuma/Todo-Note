<script setup lang="ts">
import DrawerTrigger from '@/screens/Home/SideBar/DrawerTrigger.vue';
import Time from '@/components/Time.vue';
import { Button, Inplace } from 'primevue';
import InplaceEdit from '@/screens/Home/Note/components/InplaceEdit.vue';
import { watch } from 'vue';
import { noteOps } from '@/api/note/note';

const visible = defineModel<boolean>('visible', {
  default: true,
  type: Boolean
});
const note_title = defineModel<string>('note_title', {
  default: '',
  type: String
});
const emit = defineEmits<{
  (e: 'updateTitle', title: string): void;
}>();

if (note_title) {
  watch(note_title, (newTitle) => {
    emit('updateTitle', newTitle);
  });
}

export type PageHeaderAction = {
  label: string;
  icon?: string;
  onClick: () => void;
}
const { title, actions } = defineProps<{
  title: string;
  actions: PageHeaderAction[];
}>();
</script>

<template>
  <div class="w-full h-9 flex items-center gap-2.5">
    <DrawerTrigger class="-mr-2.5" v-model="visible" />
    <h2 class="text-2xl text-primary font-semibold">{{ title }}</h2>
    <InplaceEdit v-if="note_title" v-model="note_title" />
    <Button class="size-6 btn-scale transition-all! duration-300!" severity="secondary" variant="outlined" rounded
      v-for="action in actions" :key="action.label" @click="action.onClick">
      <i :class="action.icon"></i>
    </Button>
    <Time class="ml-auto" />
  </div>
</template>