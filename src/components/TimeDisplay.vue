<script setup lang="ts">
import { Tooltip } from 'primevue';
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  time: Date
  currentTime?: Date
}>()

const now = ref(new Date())

let timer: number | undefined
onMounted(() => {
  if (props.currentTime === undefined) {
    timer = window.setInterval(() => {
      now.value = new Date()
    }, 1000)
  }
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function formatRelativeTime(input: Date, current: Date): string {
  const nowDate = new Date(current)
  const date = new Date(input)
  const diff = nowDate.getTime() - date.getTime()
  const diffSec = Math.floor(diff / 1000)

  // 时间过于靠近的时候默认显示不久前
  if (diffSec < -1000) {
    const futureSec = Math.abs(diffSec)
    const futureMin = Math.floor(futureSec / 60)
    const futureHour = Math.floor(futureMin / 60)
    const futureDay = Math.floor(futureHour / 24)
    const futureMonth = Math.floor(futureDay / 30)
    const futureYear = Math.floor(futureDay / 365)

    if (futureSec < 60) return '不久后'
    if (futureMin < 60) return `${futureMin} 分钟后`
    if (futureHour < 24) return `${futureHour} 小时后`
    if (futureDay < 30) return `${futureDay} 天后`
    if (futureMonth < 12) return `${futureMonth} 月后`
    return `${futureYear} 年后`
  }

  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return '不久前'
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay < 30) return `${diffDay} 天前`
  if (diffMonth < 12) return `${diffMonth} 月前`
  return `${diffYear} 年前`
}

const display = computed(() =>
  formatRelativeTime(props.time, props.currentTime ?? now.value)
)
</script>

<template>
  <span v-tooltip.bottom="(new Date(time)).toLocaleString()">{{ display }}</span>
</template>

<style scoped>
</style>