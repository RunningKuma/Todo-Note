<script setup lang="ts">
import { NoteMeta } from '@/api/types/note';
import { Tooltip } from 'primevue';
import InplaceEdit from './InplaceEdit.vue';
import { computed, watch } from 'vue';


const noteMeta = defineModel<NoteMeta | undefined>({
  default: {},
  type: Object as () => NoteMeta
});

const tags = computed({
  get: () => noteMeta.value?.tags || [],
  set: (value: string[]) => {
    if (noteMeta.value) {
      noteMeta.value.tags = value;
    }
  }
});
watch(() => noteMeta.value?.tags, (newTags) => {
  if (noteMeta.value) {
    noteMeta.value.tags = newTags;
  }
}, { immediate: true, deep: true });
</script>
<template>
  <div v-if="noteMeta">
    <div class="flex gap-1.5">
      <span class="inline-flex items-center gap-1">
        <i v-tooltip.bottom="'创建时间'" class="pi pi-calendar text-secondary" ></i>
        <span class="text-sm text-secondary">{{ noteMeta?.create.toLocaleString() }}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        <i v-tooltip.bottom="'更新时间'" class="pi pi-pencil text-secondary" ></i>
        <span class="text-sm text-secondary">{{ noteMeta?.modified.toLocaleString() }}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        <i v-tooltip.bottom="'Tags'" class="pi pi-tags text-secondary" ></i>
        <InplaceEdit class="text-sm text-secondary" v-model="tags" />
      </span>

    </div>
  </div>
</template>
<style scoped></style>