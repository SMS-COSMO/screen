<template>
  <!-- 以下是错误页面，有想法可以自行修改 -->
  <div id="error-display-box" :class="cn('w-full h-full bg-grey-500 border-current border-2', props.class)">
    <div class="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <h2 class="text-2xl font-bold mb-4">视频播放错误</h2>
      <p class="text-lg mb-4">很抱歉，视频无法播放。请稍后再试或联系管理员。</p>
      <p class="text-sm text-gray-600">错误信息：{{ props.error?.message || '未知错误' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
  error: MediaError | null;
}>();

</script>