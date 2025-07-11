<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { Button } from 'primevue';

const visible = defineModel<boolean>({
  default: true,
  type: Boolean
});

</script>

<template>
  <PageHeader v-model:visible="visible" title="Dashboard" :actions="[]"/>
  <div class="overview-grid">
    <div class="left-panel">
      <h1 class="text-2xl"></h1>
    </div>
    <div class="right-panel">
      <h1 class="text-2xl"></h1>
    </div>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}
.left-panel {
  padding: 1rem;
}
.right-panel {
  padding: 1rem;
}
</style>