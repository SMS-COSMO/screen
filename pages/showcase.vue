<template>
  <Title>内容展示</Title>
  <div class="left-[22vw] h-[100vh] border-2 fixed" />
  <!-- 这是那一条竖线 -->
  <div class="grid gap-4 md:gap-8 fixed left-1/4 h-[100vh] w-3/4 bg-gray-200 dark:bg-gray-900">
    <div class="flex items-center justify-center text-muted-foreground">
      <!-- 你可能会疑惑，为什么 div 后面还跟个 span, 写在一起不好吗? 我有试着这么写，结果 swiper.next() 不跑了 -->
      <span class="border-0 p-4 rounded-none max-w-[75vw]">
        <!-- 根据经验, 这里必须限定 max-w, 否则整个 swiper 会飞起来 -->
        <swiper-container ref="swiperBasicRef" :loop="true">
          <swiper-slide v-for="content in contentList" :key="content.id" class="flex justify-center items-center text-white">
            <div v-if="content.state === 'approved'" class="flex">
              <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType" image-class="h-[90vh] w-auto" />
            </div>
          </swiper-slide>
        </swiper-container>
      </span>
    </div>
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
