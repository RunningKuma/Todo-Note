<script setup>
import { RouterView } from "vue-router";
import { ConfirmDialog, Toast } from 'primevue';
</script>

<template>
  <RouterView />
  <ConfirmDialog />
  <Toast />
</template>

<style>
@import './styles/global.css';
</style>
