<template>
  <Title>
    媒体缓存
  </Title>
  <Button @click="cacheContent()">
    缓存
  </Button>
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

const { data: contentList, suspense } = useQuery({
  queryKey: ['content', 'all'],
  queryFn: () => $api.content.list.query(),
});
await suspense(); // 找到content

// const {mutate:UpdateContentMutation} = useMutation({
//   mutationFn:$api.content.updateInfo.query()
// })

const ItemsToCache: Ref<TCacheItem[]> = computed(() => {
  return (contentList.value || [])
    .filter((content) => {
      return content.state === 'approved';
    })
    .map(content => ({
      id: content.id.toString(),
      url: content.S3FileId,
      type: content.fileType === 'video' ? 'video' : 'image',
      createdAt: content.createdAt,
      size: 0,
      lastAccessedAt: new Date(),
      store: 'disk',
    }),
    );
});

async function cacheContent() {
  try {
    for (const item of ItemsToCache.value) await diskCacheController.setItem(item);
    diskCacheController.preload('stream');
  } catch (err) {
    toast('缓存失败');
    useErrorHandler(err);
  }
  console.log('缓存操作结束');
}
</script>
