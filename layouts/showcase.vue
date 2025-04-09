<template>
  <div class="min-h-screen bg-background">
    <!-- 左上角的区域，时间在上，天气在下 -->
    <div class="border-2 border-gray-270 rounded-lg fixed top-6 left-6 w-1/6 p-3 z-50 shadow-lg">
      <TimeCard />
      <WeatherCard />
    </div>
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import WeatherCard from '~/components/WeatherCard.vue';
import TimeCard from '~/components/TimeCard.vue';
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
