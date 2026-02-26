<template>
  <Title>
    媒体缓存
  </Title>
  <Button @click="cacheContent()">
    缓存
  </Button>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>文件ID</TableHead>
        <TableHead>类型</TableHead>
        <TableHead>缓存情况</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="item in cacheList" :key="item.id">
        <TableCell>{{ item.id }}</TableCell>
        <TableCell>{{ item.type }}</TableCell>
        <TableCell @click="console.log(item.memory_cached, item.disk_cached)" class="">{{ item.memory_cached ? '内存缓存:' + item.memory_cached.length + ' bytes' : '' }} {{ item.disk_cached ? '磁盘缓存:' + item.disk_cached.length + ' bytes' : '' }} {{ !item.memory_cached && !item.disk_cached ? '未缓存' : '' }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { DiskCacheController, MemoryCacheController, diskCacheController } from '~/lib/cache/cache';
import type { ICacheProvider, TCacheItem } from '~/lib/cache/cacheType';
import type { GetFileUrl, PreloadProgress } from '~/lib/cache/cache';

import type { TRawContent } from '~/server/db/db';

const userStore = useUserStore();
const { $api } = useNuxtApp();
const isCaching = ref(false);
const process = ref();

const flag = ref(true);

const { data: contentList, suspense } = useQuery({
  queryKey: ['content', 'all'],
  queryFn: () => $api.content.list.query(),
});
await suspense(); // 找到content

// const {mutate:UpdateContentMutation} = useMutation({
//   mutationFn:$api.content.updateInfo.query()
// })

console.log('contentList', contentList.value);  

const ItemsToCache: Ref<TCacheItem[]> = computed(() => {
  const _ = flag.value;
  return (contentList.value || [])
    .filter((content) => {
      return content.state === 'approved';
    })
    .map(content => ({
      id: content.id.toString(),
      url: content.S3FileId,
      type: content.fileType.split('/')[0] === 'video' ? 'video' : 'image',
      createdAt: content.createdAt,
      size: 0,
      lastAccessedAt: new Date(),
      store: 'disk',
    }),
    );
});

const memoryCacheController = new MemoryCacheController(200 * 1024 * 1024, (key: string) => $api.s3.getViewURL.query({ s3FileId: key }));

const cacheList = ref<Array<{ id: string; type: string; memory_cached?: Uint8Array<ArrayBuffer>; disk_cached?: Uint8Array<ArrayBuffer> }>>([]);

watchEffect(async (onInvalidate) => {
  const items = ItemsToCache.value || [];
  let cancelled = false;
  onInvalidate(() => { cancelled = true; });

  const res = await Promise.all(items.map(async (item) => ({
    id: item.id,
    type: item.type,/* 
    memory_cached: (await memoryCacheController.getItem(item.id))?.storeRef,
    disk_cached: (await diskCacheController.getItem(item.id))?.storeRef, */
    memory_cached: await (await memoryCacheController.getCache(item.id))?.bytes(),
    // disk_cached: await (await diskCacheController.getCache(item.id))?.bytes(),
  })));

  if (!cancelled) cacheList.value = res;
});

console.log('ItemsToCache', ItemsToCache.value);

/* async function cacheContent() {
  try {
    for (const item of ItemsToCache.value) {
      await diskCacheController.setItem(item);
      // console.log('Cached item', item);
    }
    let result = await diskCacheController.preload('stream', (progress) => {
      console.log(progress.message);
    });
    /* result.progress.subscribe((progress: PreloadProgress) => {
      console.log(`Preload progress: ${progress.loaded}/${progress.total} (${(progress.loaded / progress.total * 100).toFixed(2)}%)`);
      process.value = progress;
    }); *
    if(result !== void 0) {
      for await (const progress of result) {
        console.log(`Preload progress: ${progress.loaded}/${progress.total} (${(progress.loaded / progress.total * 100).toFixed(2)}%)`);
        process.value = progress;
      }
    }
    console.log('Preload complete');
    toast('缓存完成');
  } catch (err) {
    toast('缓存失败');
    useErrorHandler(err);
  }
  console.log('缓存操作结束');
} */

async function cacheContent() {
  try {
    for (const item of ItemsToCache.value) {
      await memoryCacheController.setItem(item);
      // console.log('Cached item', item);
    }
    let result = await memoryCacheController.preload('stream', (progress) => {
      console.log(progress.message);
    });
    /* result.progress.subscribe((progress: PreloadProgress) => {
      console.log(`Preload progress: ${progress.loaded}/${progress.total} (${(progress.loaded / progress.total * 100).toFixed(2)}%)`);
      process.value = progress;
    }); */
    if(result !== void 0) {
      for await (const progress of result) {
        console.log(`Preload progress: ${progress.loaded}/${progress.total} (${(progress.loaded / progress.total * 100).toFixed(2)}%)`);
        process.value = progress;
      }
    }
    console.log('Preload complete');
    toast('缓存完成');
  } catch (err) {
    toast('缓存失败');
    useErrorHandler(err);
  }
  flag.value = !flag.value; // 触发 cacheList 更新
  console.log('缓存操作结束');
}
</script>
