<template>
  <Title>内容展示</Title>
  <div class="left-[21.5vw] w-[0.5vw] h-[100vh] bg-gray-400 fixed" />
  <!-- 这是那一条竖线 -->
  <div class="flex left-[22vw] h-[100vh] w-[78vw] bg-gray-800 dark:bg-gray-200 fixed justify-center items-center">
    <ClientOnly>
      <swiper-container ref="swiperRef" :loop="true" class="max-w-[78vw]">
        <!-- 根据经验, 这里必须限定 max-w, 否则整个 swiper 会飞起来 -->
        <swiper-slide v-for="content in computedContentList" :key="content.id" class="flex">
          <div v-if="content.state === 'approved'"
            class="flex h-[100vh] w-[78vw] justify-center items-center text-white dark:text-black">
            <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType"
              image-class="h-[100vh] w-auto object-contain" video-class="h-auto w-[78vw] object-contain"
              :video-player-options="playerOptions" @update-instance="getVideoInstances(content.id, $event)" />
          </div>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
    <!-- <Button class="debug" @click="toPlay"></Button> -->
  </div>
</template>

<script setup lang="ts">
import type { TRawContent } from '~/server/db/db';

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
  queryFn: () => $api.device.contents_.query({ id: deviceId }),
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

type videoInstance = {
  player: any,
  state: any,
  video: any,
};
/* const videoInstances: Ref<{ [key: number]: videoInstance }[]> = ref([]); */
/* const videoInstances: Ref<{ key: number, instance: videoInstance }[]> = ref([]); */
const videoInstances = reactive(new Map());
const getVideoInstances = (id: number, instance: any) => {
  console.log("player instance of swiper %d is mapped:", id, instance.player.play());
  /* videoInstances.value.push({id, instance}); */
  /* videoInstances.value.push({ id: instance });
  console.log("instance in map:", videoInstances.value[id]); */
  videoInstances.set(id, instance);
  console.log("instance in map:", videoInstances.get(id));
  console.log("the whole map:", videoInstances);
};
/* const toPlay = () => onNuxtReady(() => {
  console.log(tempInstance);
  tempInstance.player.play();
  console.log(tempInstance.state.playing);
}); */

const updater = ref(true);

const computedContentList: Ref<(TRawContent)[]> = computed(() => {
  if (updater && !updater)
    return []; // 这一步是为了让 updater 在形式上加入计算，这样之后变动 updater 就可以重置这里的随机数
  const list: (TRawContent)[] = [];
  contentList.value?.forEach((item) => {
    if (Array.isArray(item)) {
      const randomKey = Math.floor(Math.random() * item.length);
      item.forEach((content) => {
        if (item.indexOf(content) === randomKey)
          list.push(content); // push a random content into the list
      });
    }
    else {
      list.push(item);
    }
  })
  return list;
});

const timer = ref(0);

/* onMounted(() => {
  //setInterval(() => { timer.value += 0.1; }, 100);
  while (1) {
    computedContentList.value.forEach((content) => {
      console.log(swiper.instance)
    swiper.next();
      setTimeout(() => {
        swiper.next();
      }, content.duration * 1);
    })
  }
}) */

/* onMounted(setInterval(() => {
  computedContentList.value.forEach((content) => {
    content.duration;
  })
}, 100)) */
</script>
