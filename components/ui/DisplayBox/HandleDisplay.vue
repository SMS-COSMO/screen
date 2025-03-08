<!-- 用于处理文件类型,并选择适合的播放器 -->
<script setup lang="ts">
  import ImageBox from './ImageBox.vue';
  import VideoBox from './VideoBox.vue';
  // 处理函数
  function checkMediaType(url: string) {
    // 清理 URL（移除查询参数和哈希）
    const cleanUrl = url.split(/[?#]/)[0];
    // 提取扩展名（转为小写）
    const extension = (cleanUrl.split('.').pop() || '').toLowerCase();

    // 图片类型列表
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    // 视频类型列表
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];

    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (videoExtensions.includes(extension)) {
      return 'video';
    } else {
      return 'unknown';
    }
  }

  // 定义 props, 传输展示地址
  const props = defineProps<{
    srcKey: string;
  }>();
  // onMounted(()=> {
  //   console.log('props.srcKey', props.srcKey);
  //   console.log('checkMediaType', checkMediaType(props.srcKey));
  // })

</script>

<template>
  <div class="max-h-100% justify-center items-center">
    <ImageBox v-if="checkMediaType(props.srcKey) === 'image'" :imageKey="props.srcKey" />
    <VideoBox v-else-if="checkMediaType(props.srcKey) === 'video'" :videoKey="props.srcKey" />
    <span v-else>未知文件类型, 无法预览</span>
  </div>
</template>

<style scoped>
  
</style>