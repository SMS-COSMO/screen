<template>
  <Title>内容展示</Title>
  <div class="left-[21.5vw] w-[0.5vw] h-[100vh] bg-gray-400 fixed" />
  <!-- 这是那一条竖线 -->
  <div class="flex left-[22vw] h-[100vh] w-[78vw] bg-gray-800 dark:bg-gray-200 fixed justify-center items-center">
    <!-- 我发现 span 删掉好像也可以（擦汗） -->
    <swiper-container ref="swiperBasicRef" :loop="true" class="max-w-[78vw]">
      <!-- 根据经验, 这里必须限定 max-w, 否则整个 swiper 会飞起来 -->
      <swiper-slide v-for="content in contentList" :key="content.id" class="flex justify-center items-center text-white">
        <div v-if="content.state === 'approved'" class="flex">
          <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType" image-class="h-[100vh] w-auto object-contain" video-class="h-[100vh] w-auto object-contain" />
        </div>
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<script setup lang="ts">
// 设置使用 showcase 布局
definePageMeta({
  layout: 'showcase',
  name: 'showcase',
});

const { $api } = useNuxtApp();

const { data: contentList, suspense } = useQuery({
  queryKey: ['content', 'list'],
  queryFn: () => $api.content.list.query(),
});
await suspense();

const swiperBasicRef = ref(null);
const swiper1 = useSwiper(swiperBasicRef);

const { ArrowLeft, ArrowRight } = useMagicKeys();
watch([ArrowLeft, ArrowRight], (v) => {
  if (v[0])
    swiper1.prev();
  if (v[1])
    swiper1.next();
});
</script>

<style lang="css">
.swiper-wrapper {
  display: flex;
  flex-direction: column;
}

.swiper-basic-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid black;
}

.swiper-basic-buttons button:hover {
  background-color: black;
  color: white;
}
</style>
