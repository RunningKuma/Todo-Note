<script setup lang="ts">
import { ref } from 'vue';


const time = ref(new Date());
setInterval(() => {
  time.value = new Date();
}, 1000);
</script>

<template>
  <h1 class="">{{ time.toLocaleString() }}</h1>
</template>