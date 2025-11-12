<!-- 用于处理文件类型,并选择适合的播放器 -->
<template>
  <div class="max-h-100% justify-center items-center">
    <ImageBox v-if="checkMediaType(props.filetype) === 'image'" :image-key="props.srcKey" :class="props.imageClass" />
    <VideoBox v-else-if="checkMediaType(props.filetype) === 'video'" :video-key="props.srcKey" :class="props.videoClass" :player-options="props.videoPlayerOptions" @update-instance="onPlayerReady" />
    <span v-else>未知文件类型, 无法预览</span>
  </div>
</template>

<script setup lang="ts">
import ImageBox from './ImageBox.vue';
import VideoBox from './VideoBox.vue';
// 定义 props, 传输展示地址
// srcKey实际为一个
const props = withDefaults(
  defineProps<{
    srcKey: string;
    filetype: string;
    imageClass?: string;
    videoClass?: string;
    videoPlayerOptions?: {
      autoplay: boolean;
      controls: boolean;
      responsive: boolean;
      preload: string;
      notSupportedMessage: string;
    };
  }>(),
  {
    imageClass: 'h-[71vh]',
    // 在小屏下默认最大高度为50vh，大于768px时设置为600px
    videoClass: 'max-h-[50vh] md:max-h-[600px]',
    // 定义视频播放器的配置项
    videoPlayerOptions() {
      return {
        autoplay: true,
        controls: true,
        responsive: true,
        preload: 'auto' as const,
        notSupportedMessage: '此视频暂无法播放，请稍后再试',
      };
    },
  },
);

// 处理函数
function checkMediaType(fileType: string) {
  // fileType由斜杠分隔，斜杠前面的部分为图片或视频类型
  const mainType = fileType.split('/')[0];
  if (mainType === 'image')
    return 'image';
  else if (mainType === 'video')
    return 'video';
  else
    return 'unknown';
}

// onMounted(()=> {
//   console.log('props.srcKey', props.srcKey);
//   console.log('checkMediaType', checkMediaType(props.srcKey));
// })

const emit = defineEmits(['updateInstance']);
// 获取实例并通过 updateInstance 事件传输至父组件
const onPlayerReady = (playerInstance: any) => {
  console.log("player instance received:", playerInstance);
  emit('updateInstance', playerInstance);
}
</script>

<style scoped>

</style>
