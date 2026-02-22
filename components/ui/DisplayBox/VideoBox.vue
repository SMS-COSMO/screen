<!-- 视频播放器 -->
<!-- 注: VideoPlayer有内部样式, 需要样式覆盖才能够修改大小 -->
<template>
  <!-- 设置宽度自适应、居中和16:9 横纵比 -->
  <div :class="cn('w-full mx-auto aspect-[16/9]', props.class)">
    <!-- video-player 组件设置为充满容器 -->
    <VideoPlayer
      class="w-full h-full"
      :src="typeof url === 'string' ? url : undefined"
      :options="props.playerOptions"
      @mounted="onPlayerReady"
    />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { VideoPlayer } from '@videojs-player/vue';
import { cn } from '@/lib/utils';
import 'video.js/dist/video-js.css';
import type { TPlayerInstance } from '~/lib/video-player/playerInstanceType';

// 定义 props, 传输视频地址
const props = defineProps<{
  videoKey: string;
  class?: HTMLAttributes['class'];
  // 获取视频播放器的配置项
  playerOptions: object;
}>();
const { $api } = useNuxtApp();

// 进行视频查询操作
// 被注释代码为调试用
// console.log('props.videoKey=', props.videoKey);
const url = await $api.s3.getViewURL.query({ s3FileId: props.videoKey });
// console.log('url=', url);
// const data = fetch(url).then(res => res.json()).then(data => console.log('data=', data));
// axios.get(url).then(res => console.log('res=', res));

// const playerInstance = ref(null);
const emit = defineEmits(['updateInstance']);
// 获取 player 实例并通过 updateInstance 事件传输至父组件
const onPlayerReady = (player: TPlayerInstance) => {
  // playerInstance.value = player;
  console.log("player ready:", player);
  emit('updateInstance', markRaw(player)); // 使用了 markRaw 函数来避免 Proxy
}
/*
  注：这里函数被传入的 player 实例的类型是
  { player: Player2, state: Proxy({ playing: false, ... }), video: video#vjs_video_xxxx_html5_api.vjs-tech }
  state 属性的 Proxy 是必要的, 因为这保证了响应式.
*/
</script>
