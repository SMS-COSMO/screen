import { DiskCacheController } from '~/lib/cache/cache'

const MAXBYTES_MEMORY = 200 * 1024 * 1024;// 200 MB

export default defineNuxtPlugin(() => {
  const { $api } = useNuxtApp();
  const DiskCache: DiskCacheController = new DiskCacheController(
    MAXBYTES_MEMORY,
    (key: string) => $api.s3.getViewURL.query({ s3FileId: key }),
  );

  return {
    provide: {
      DiskCache,
    },
  };
})

// 如果导入失败了，可以试试以下代码：

/* declare module '#app' { 
  interface NuxtApp {
    $DiskCache: DiskCacheController;
  }
} */