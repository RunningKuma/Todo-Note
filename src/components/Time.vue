<script setup lang="ts">
import { ref, computed } from 'vue';
import TimeFlipCard from './TimeFlipCard.vue';

const time = ref(new Date());
setInterval(() => {
  time.value = new Date();
}, 1000);

const hour = computed(() => String(time.value.getHours()).padStart(2, '0'))
const minute = computed(() => String(time.value.getMinutes()).padStart(2, '0'))
const second = computed(() => String(time.value.getSeconds()).padStart(2, '0'))
</script>

<template>
  <div class="flip-clock">
    <TimeFlipCard :value="hour" label="时" />
    <span class="colon font-bold m-2">:</span>
    <TimeFlipCard :value="minute" label="分" />
    <span class="colon font-bold m-2">:</span>
    <TimeFlipCard :value="second" label="秒" />
  </div>
</template>

<style>
.colon {
  line-height: 28px;
}
</style>