<template>
  <Title>内容展示</Title>
  <div class="left-[21.5vw] w-[0.5vw] h-[100vh] bg-gray-400 fixed" />
  <!-- 这是那一条竖线 -->
  <div class="flex left-[22vw] h-[100vh] w-[78vw] bg-gray-800 dark:bg-gray-200 fixed justify-center items-center">
    <ClientOnly>
      <swiper-container ref="swiperRef" :loop="computedContentList.length - 1 ? true : false" class="max-w-[78vw]">
        <!-- 根据经验, 这里必须限定 max-w, 否则整个 swiper 会飞起来 -->
        <swiper-slide v-for="(content, index) in computedContentList" :key="content.id" class="flex">
          <div v-if="content.state === 'approved'"
            class="flex h-[100vh] w-[78vw] justify-center items-center text-white dark:text-black">
            <HandleDisplay :src-key="content.S3FileId" :filetype="content.fileType"
              image-class="h-[100vh] w-auto object-contain" video-class="h-auto w-[78vw] object-contain"
              :video-player-options="playerOptions" @update-instance="getVideoInstances(index, $event)" />
          </div>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
    <!-- <Button class="debug" @click="toPlay"></Button> -->
  </div>
  <div v-if="!isPageInteracted" id="force-interact" class="fixed z-50 top-0 left-0 w-full h-full bg-black opacity-75"
    @click="isPageInteracted = true">
    <p class="text-white text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Click to enable video
      playback</p>
  </div>
</template>

<script setup lang="ts">
import type { TPlayerInstance } from '~/lib/video-player/playerInstanceType';
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

const isPageInteracted = ref(false);

type videoInstance = {
  player: any,
  state: any,
  video: any,
};
/* const videoInstances: Ref<{ [key: number]: videoInstance }[]> = ref([]); */
/* const videoInstances: Ref<{ key: number, instance: videoInstance }[]> = ref([]); */
const videoInstances = reactive(new Map<number, TPlayerInstance>()); // 由于之前的代码会导致 相同 id 的播放器实例 相互覆盖掉，所以改用在 computedContentList 里的 index 当键了
const getVideoInstances = (id: number, instance: TPlayerInstance) => {
  // console.log("player instance of swiper %d is mapped:", id, instance.player.play());
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
  const _ = updater.value; // 这一步是为了让 updater 在形式上加入计算，这样之后变动 updater 就可以重置这里的随机数
  const list: (TRawContent)[] = [];
  console.log("constructing content list...");
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

const activeIndex = ref(0); // 表示目前正在显示的 swiper 的下标。在 loop 模式下，从 swiper 实例中获取的 activeIndex 始终是最后一个元素的 index，所以不能从那里读取

async function mainLoop() {
  const index = activeIndex.value;
  // console.log("active index:", index);
  
  // console.log("start content:", index);

  const content = computedContentList.value[index];
  const fileType = content.fileType.split('/')[0];
  const videoInstance = (fileType === 'video')? videoInstances.get(index) : undefined;

  if (fileType === 'video') { // 如果当前内容是视频
    videoInstance?.player.currentTime(0); // 从头开始播放
    await videoInstance?.player.play();
  }
  // setTimeout(mainLoop, computedContentList.value[index].duration * 1000);

  setTimeout(() => {
    if (fileType === 'video') { // 如果当前内容是视频
      videoInstance?.player.pause(); // 暂停视频播放
    }

    // console.log("active index now (before next):", activeIndex.value);
    activeIndex.value = (activeIndex.value + 1); // 更新 activeIndex

    if (activeIndex.value === computedContentList.value.length) { // 如果已经播完一轮，重置内容列表
      updater.value = !updater.value; // 重置 computedContentList
      activeIndex.value = 0; // 重置 activeIndex
    }

    swiper.next();

    mainLoop(); //
  }, content.duration * 1000);

}

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

//localStorage.setItem(s3fileId, cached_content);

/* function testLoop() { //
  swiper.next();
  console.log("active index:", swiper.instance.value?.activeIndex);
  setTimeout(testLoop, 1000);
} */

watch(isPageInteracted, mainLoop); // 只有在用户点击了页面之后才开始循环播放内容，以确保视频能够正常播放
/* console.log("swiper:", swiper);
onMounted(() => {
  console.log("swiper-instance:", swiper.instance.value);
}); */

/* while(process.client){
  updater.value = !updater.value; 
  console.log(computedContentList.value[2]);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 5 秒
} */
</script>
