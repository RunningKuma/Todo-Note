<script setup>
import { RouterView } from "vue-router";
import { ConfirmDialog } from 'primevue';
</script>

<template>
  <RouterView/>
  <ConfirmDialog />
</template>

<style>
@import './styles/global.css';
</style>
