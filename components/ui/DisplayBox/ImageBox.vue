<!-- 用于展示图片的组件 -->
<!-- 使用VueUse的Image -->
<script setup lang="ts">
  import { useImage } from '@vueuse/core';
  import { ref } from 'vue';
  // 初始化查询前置
  const { $api } = useNuxtApp();
  const queryClient = useQueryClient();
  // 定义 props, 传输图片地址
  const props = defineProps<{
    imageKey: string;
  }>();

  // 进行图片查询操作
  console.log('props.imageKey', props.imageKey);
  const url = await $api.s3.getViewURL.query({s3FileId: props.imageKey});
  console.log('url', url);
  
  // 使用 useImage 处理图片加载状态
  const { isLoading, error } = useImage({
    // @ts-ignore
    src: url,
  });

  // 实现点击放大(已废弃)
  // const isFullScreen = ref(false);
  // const img = ref<HTMLImageElement | null>(null);
  // function handleFullScreen() {
  //   isFullScreen.value = !isFullScreen.value;
  //   img.value?.style.setProperty('max-width', isFullScreen.value ? '100%' : '50%');
  // }
</script>

<template>
  <span v-if="isLoading" class="text-center">加载中...</span>
  <span v-else-if="error" class="text-center">加载失败</span>
  <img class="h-[71vh] w-auto m-auto" ref="img" v-else :src="url || undefined">
</template>

<style scoped>
</style>