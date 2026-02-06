import type { ICacheProvider, TCacheItem } from './cacheType';
import { S3Controller } from './s3';

const MAXBYTES_MEMORY = 200 * 1024 * 1024; // 200 MB
interface PreloadProgress {
  loaded: number; // 已缓存对象数
  total: number; // 总对象数
  cachedBytes: number; // 已缓存字节数
  totalBytes: number; // 总字节数
  mode: 'full' | 'stream';
  done: boolean;
  message?: string; // 信息
};

class BaseCacheController implements ICacheProvider {
  protected itemStore: Map<string, TCacheItem> = new Map();
  protected cacheStore: Map<string, Blob> = new Map();
  protected s3Controller: S3Controller;
  protected maxBytes: number;
  constructor(maxBytes: number = MAXBYTES_MEMORY) {
    this.maxBytes = maxBytes;
    this.s3Controller = new S3Controller();
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async preload(method: any, ...args: any[]): Promise<any> {
    // 仅仅为了满足接口要求
    throw new Error('Method not implemented.');
  }

  async getItem(id: string): Promise<TCacheItem | null> {
    const item = this.itemStore.get(id) || null;
    if (item) {
      item.lastAccessedAt = new Date();
    }
    return item;
  }

  async setItem(item: TCacheItem): Promise<void> {
    this.itemStore.set(item.id, item);
    // Here we would also store the actual data incacheStore
  }

  async deleteItem(id: string): Promise<void> {
    this.itemStore.delete(id);
    this.cacheStore.delete(id);
  }

  async getCache(id: string): Promise<Blob | null> {
    return this.cacheStore.get(id) || null;
  }

  async clearExpiredItems(): Promise<void> {
    const now = new Date();
    for (const [id, item] of this.itemStore) {
      if (item.ttl && now.getTime() - item.createdAt.getTime() > item.ttl * 1000) {
        this.itemStore.delete(id);
        this.cacheStore.delete(id);
      }
    }
  }

  async fetchProgressive(url: string, progress: PreloadProgress, progressCallback?: (progress: PreloadProgress) => void): Promise<Blob | null> {
    let lastReceived = 0;
    let downloadedBlob: Blob | null = null;
    for await (const update of this.fetchBlobWithProgress(url)) {
      if (update.blob) {
        downloadedBlob = update.blob;
        break;
      }
      const delta = update.received - lastReceived;
      lastReceived = update.received;
      if (delta > 0) {
        progress.cachedBytes += delta;
        progressCallback?.({ ...progress, mode: 'full', done: false });
      }
    }
    if (!downloadedBlob) {
      return null;
    }
    return downloadedBlob;
  }

  protected async *fetchBlobWithProgress(url: string): AsyncGenerator<{ received: number; total: number; blob?: Blob }> {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      yield { received: 0, total: 0 };
      return;
    }
    const total = Number(response.headers.get('content-length') ?? 0);
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      if (value) {
        chunks.push(value as BlobPart);
        received += value.length;
        yield { received, total };
      }
    }
    const blob = new Blob(chunks);
    yield { received, total, blob };
  }

  protected async getCurrentMemoryUsage(): Promise<number> {
    let total = 0;
    for (const blob of this.cacheStore.values()) {
      total += blob.size;
    }
    return total;
  }

  protected async isOverMemoryLimit(): Promise<boolean> {
    // 检查前先清理
    this.clearExpiredItems();
    const currentUsage = await this.getCurrentMemoryUsage();
    return currentUsage > this.maxBytes;
  }

  async invalidationCache(id: string): Promise<void> {
    this.cacheStore.delete(id);
  }
}

class MemoryCacheController extends BaseCacheController {
  async preload(
    method: string,
    progressCallback?: (progress: PreloadProgress) => void,
    option?: { sort: (map: Map<string, TCacheItem>) => Map<string, TCacheItem> },
  ): Promise<void | AsyncGenerator<PreloadProgress>> {
    // 两种缓存方法, 全量缓存与流缓存, 根据 method 决定
    if (method === 'full')
      await this.fullPreload(progressCallback);
    else if (method === 'stream')
      // 如果想要依照次序缓存, 进行排序
      return this.streamPreload(progressCallback, option);
  }

  private async fullPreload(progressCallback?: (progress: PreloadProgress) => void): Promise<void> {
    const progress: PreloadProgress = {
      message: '',
      mode: 'full',
      done: false,
      loaded: 0,
      total: this.itemStore.size,
      cachedBytes: 0,
      totalBytes: Array.from(this.itemStore.values()).reduce((acc, item) => acc + item.size, 0),
    };
    for (const item of this.itemStore.values()) {
      // 检测内存使用情况是否溢出
      if (await this.isOverMemoryLimit()) {
        progress.message += 'Memory limit exceeded, stopping preload.\n';
        return;
      }
      // 已经有缓存则不再缓存
      if (this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'full' });
        continue;
      }
      // Simulate caching the item
      const res = await this.s3Controller.getFileUrl(item.url);
      if (!res) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        continue;
      }
      const data = await this.fetchProgressive(res, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        continue;
      }
      this.cacheStore.set(item.id, data);
      this.itemStore.set(item.id, { ...item, lastAccessedAt: new Date(), storeRef: item.id });
      progress.loaded += 1;
      progressCallback?.({ ...progress, mode: 'full', done: progress.loaded === progress.total });
    }
  }

  async *streamPreload(progressCallback?: (progress: PreloadProgress) => void, option?: { sort: (map: Map<string, TCacheItem>) => Map<string, TCacheItem> }): AsyncGenerator<PreloadProgress> {
    const progress: PreloadProgress = {
      message: '',
      mode: 'stream',
      done: false,
      loaded: 0,
      total: this.itemStore.size,
      cachedBytes: 0,
      totalBytes: Array.from(this.itemStore.values()).reduce((acc, item) => acc + item.size, 0),
    };
    // 进行排序
    const newItemStore = option?.sort ? option.sort(this.itemStore) : this.itemStore;
    for (const item of newItemStore.values()) {
      // 检测内存使用情况是否溢出
      if (await this.isOverMemoryLimit()) {
        progress.message += 'Memory limit exceeded, stopping preload.\n';
        yield { ...progress, done: true };
        return;
      }
      // 若已经有缓存, 不再次缓存
      if (this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'stream' });
        continue;
      }
      const res = await this.s3Controller.getFileUrl(item.url);
      if (!res) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      const data = await this.fetchProgressive(res, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      this.cacheStore.set(item.id, data);
      this.itemStore.set(item.id, { ...item, lastAccessedAt: new Date(), storeRef: item.id });
      progress.loaded += 1;
      const done = progress.loaded === progress.total;
      yield { ...progress, done };
    }
  }
}

export { MemoryCacheController };
