<template>
  <div class="min-h-screen bg-background">
    <!-- 左上角的区域，时间在上，天气在下 -->
    <div class="border-2 border-gray-270 rounded-lg fixed top-6 left-6 w-1/6 p-4 z-50 shadow-lg">
      <TimeCard />
      <WeatherCard />
    </div>

    <!-- 返回按钮 -->
    <div class="fixed bottom-4 left-4 z-50">
      <Button variant="outline" size="sm" class="flex items-center gap-2" @click="$router.push('/')">
        <ArrowLeft class="h-4 w-4" />
        返回主页
      </Button>
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
