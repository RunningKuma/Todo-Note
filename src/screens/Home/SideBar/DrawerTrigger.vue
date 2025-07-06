<script setup lang="ts">
import { Button } from 'primevue';

const visible = defineModel<boolean>();
</script>

<template>
  <Button class="btn-scale transition-all! duration-300!" icon="pi pi-bars" variant="text" severity="secondary"
    size="small" @click="visible = !visible" />
</template>