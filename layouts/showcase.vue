<template>
  <div class="min-w-screen bg-background">
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <slot />
    </main>
    <!-- 左上角的区域，时间在上，天气在下 -->
    <div
      class="bg-card flex items-stretch border-2 border-gray-270 rounded-lg fixed bottom-6 left-6 right-6 h-auto z-50 max-w-full">
      <div class="flex-none">
        <TimeCard />
      </div>
      <div class="flex-1" >
        <MessageCard />
      </div>
      <div class="flex-none">
        <WeatherCard />
      </div>
    </div>
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
