<template>
  <Title>内容展示</Title>
  <div class="grid gap-4 md:gap-8">
    <Card class="col-span-4">
      <CardContent>
        <!-- 这里可以添加具体的展示内容 -->
        <div class="min-h-[500px] flex items-center justify-center text-muted-foreground">
          <Card class="bg-gray-200 p-4 rounded-lg swiper-wrapper-inner">
            <swiper-container ref="swiperBasicRef" class="swiper-basic" :loop="true">
              <swiper-slide v-for="content in contentList" :key="content.id" class="flex justify-center items-center bg-green-500 text-white">
                <div v-if="content.state === 'approved'" class="flex">
                  <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType" />
                </div>
              </swiper-slide>
            </swiper-container>

            <div class="swiper-basic-buttons">
              <button class="rounded-e-md cursor-pointer" @click="swiper1.prev()">
                Prev
              </button>
              <button class="rounded-e-md cursor-pointer" @click="swiper1.next()">
                Next
              </button>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
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
</script>

<style lang="css">
swiper-slide {
  min-height: 621px;
}

.swiper-wrapper {
  display: flex;
  flex-direction: column;
}

.swiper-wrapper-inner {
  max-width: 1104px;
}

.swiper-basic-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
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
