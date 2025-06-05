<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <main class="container">
    <RouterView/>
  </main>
</template>

<style>
@import './styles/global.css';
</style>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}

</style>