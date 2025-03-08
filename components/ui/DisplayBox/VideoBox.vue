<!-- 视频播放器 -->
<!-- 注: VideoPlayer有内部样式, 需要样式覆盖才能够修改大小 -->
<template>
  <!-- 在小屏下默认最大高度为50vh，大于768px时设置为600px，同时设置宽度自适应、居中和16:9 横纵比 -->
  <div class="w-full mx-auto aspect-[16/9] max-h-[50vh] md:max-h-[600px]">
    <!-- video-player 组件设置为充满容器 -->
    <VideoPlayer
      class="w-full h-full"
      :src="typeof url === 'string' ? url : undefined"
      :options="playerOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue';
import 'video.js/dist/video-js.css';

// 定义 props, 传输视频地址
const props = defineProps<{
  videoKey: string;
}>();
const { $api } = useNuxtApp();

// 进行图片查询操作
const url = await $api.s3.getViewURL.query({ s3FileId: props.videoKey });

// 定义视频播放器的配置项
const playerOptions = {
  autoplay: true,
  controls: true,
  responsive: true,
  preload: 'auto',
  notSupportedMessage: '此视频暂无法播放，请稍后再试',
};
</script>
