<script setup lang="ts">
import { Button } from 'primevue';

const visible = defineModel<boolean>();
</script>

<template>
  <Button class="absolute! left-2 top-2" icon="pi pi-bars" variant="outlined" color="" size="small"
    @click="visible = !visible" />
</template>