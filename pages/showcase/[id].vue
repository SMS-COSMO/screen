<template>
  <Title>内容展示</Title>
  <div class="left-[21.5vw] w-[0.5vw] h-[100vh] bg-gray-400 fixed" />
  <!-- 这是那一条竖线 -->
  <div class="flex left-[22vw] h-[100vh] w-[78vw] bg-gray-800 dark:bg-gray-200 fixed justify-center items-center">
    <swiper-container ref="swiperRef" :loop="true" class="max-w-[78vw]">
      <!-- 根据经验, 这里必须限定 max-w, 否则整个 swiper 会飞起来 -->
      <swiper-slide v-for="content in contentList" :key="content.id" class="flex">
        <div v-if="content.state === 'approved'"
          class="flex h-[100vh] w-[78vw] justify-center items-center text-white dark:text-black">
          <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType"
            image-class="h-[100vh] w-auto object-contain" video-class="h-auto w-[78vw] object-contain"
            :video-player-options="playerOptions" @update-instance="getVideoInstances(content.id, $event)" />
        </div>
      </swiper-slide>
    </swiper-container>
    <!-- <Button class="debug" @click="toPlay"></Button> -->
  </div>
</template>

<script setup lang="ts">
const { params } = useRoute();
const { $api } = useNuxtApp();
const userStore = useUserStore(); // 之前刷新显示 "用户未登录" 的错误就是因为没加这一行，导致 HandleDisplay 里调用 $api.s3.getViewURL.query() 时无法登录。难绷

// 设置使用 showcase 布局
definePageMeta({
  layout: 'showcase',
  name: `showcase/[id]`, // ?
});
// console.log(`params id: ${params.id}`);// 调试

const deviceId = Number.parseInt(typeof (params.id) === 'string' ? params.id : params.id[0]);
// console.log(`device id: ${deviceId}`);// 调试

const { data: contentList, suspense, error } = useQuery({
  queryKey: ['device', 'contents'],
  queryFn: () => $api.device.contents.query({ id: deviceId }),
});
await suspense();
if (error.value !== null)
  if (error.value.message === '设备不存在')
    onNuxtReady(() => navigateTo('/showcase'));
  else useErrorHandler(error.value);

const swiperRef = ref(null);
const swiper = useSwiper(swiperRef);

const { ArrowLeft, ArrowRight } = useMagicKeys();
watch([ArrowLeft, ArrowRight], (v) => {
  if (v[0])
    swiper.prev();
  if (v[1])
    swiper.next();
});

const playerOptions = {
  autoplay: false,
  controls: false,
  responsive: true,
  preload: 'auto' as const,
  notSupportedMessage: '此视频暂无法播放，请稍后再试',
};
1
let tempInstance = {
  player: null as any,
  state: null as any,
  video: null as any,
};
const getVideoInstances = (key: number, instance: any) => {
  console.log("player instance of swiper %d is mapped:", key, instance.player.play());
  tempInstance = instance;
  console.log("instance in map:", tempInstance);
};
/* const toPlay = () => onNuxtReady(() => {
  console.log(tempInstance);
  tempInstance.player.play();
  console.log(tempInstance.state.playing);
}); */
</script>
