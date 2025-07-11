<script setup lang="ts">
import { ref, watch } from 'vue'

const { value } = defineProps<{
  value: string
  label?: string
}>();

const animated = ref(false)
const prevValue = ref('')

watch(() => value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    prevValue.value = oldVal ?? ''
    animated.value = true
    setTimeout(() => {
      animated.value = false
      prevValue.value = newVal
    }, 600)
  }
}, { immediate: true })
</script>

<template>
  <div class="flip-card">
    <div class="card bg-primary-300 text-bold" :class="{ animated }">
      <span class="number">{{ value }}</span>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  display: inline-block;
}
.card {
  width: 40px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.6s cubic-bezier(.4,2,.3,1);
  transform-style: preserve-3d;
}
.card .number {
  width: 100%;
  text-align: center;
  padding: 2px;
  line-height: 24px;
  backface-visibility: hidden;
}
</style>