<script setup lang="ts">
import { NoteMeta } from '@/api/types/note';
import { Tooltip } from 'primevue';
import InplaceEdit from './InplaceEdit.vue';


const noteMeta = defineModel<NoteMeta>({
  default: {},
  type: Object as () => NoteMeta
});
const meta: { tooltip: string, value: Date | string | string[], icon: string, readonly?: boolean }[] = [
  { tooltip: '创建时间', value: noteMeta.value.create, icon: 'pi pi-calendar' },
  { tooltip: '更新时间', value: noteMeta.value.modified, icon: 'pi pi-pencil' }
];
if (noteMeta.value.tags) {
  meta.push({ tooltip: 'Tags', value: noteMeta.value.tags, icon: 'pi pi-tags' })
}
</script>
<template>
  <div>
    <div class="flex gap-1.5">
      <span v-for="(item, index) in meta" :key="index" class="inline-flex items-center gap-1">
        <!-- <template #content>{{ item.tooltip }}</template> -->

        <i v-tooltip.bottom="item.tooltip" :class="item.icon" class="text-secondary"></i>
        <InplaceEdit class="text-sm text-secondary" v-model="item.value" />
      </span>

    </div>
  </div>
</template>