<!-- 用于展示图片的组件 -->
<!-- 使用VueUse的Image -->
<template>
  <NuxtImg v-slot="{ isLoaded, imgAttrs, src }" :src="url || undefined" :class="cn('w-auto m-auto', props.class)" :custom="true">
    <img
      v-if="isLoaded"
      v-bind="imgAttrs"
      :src="src"
    >
    <span
      v-else
      alt="placeholder"
    >
      加载中……
    </span>
  </NuxtImg>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

// 定义 props, 传输图片地址
const props = defineProps<{
  imageKey: string;
  class?: HTMLAttributes['class'];
}>();

// 初始化查询前置
const { $api } = useNuxtApp();
// const queryClient = useQueryClient();
// 进行图片查询操作
const url = await $api.s3.getViewURL.query({ s3FileId: props.imageKey });
</script>
