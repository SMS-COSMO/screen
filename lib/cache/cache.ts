import type { ICacheProvider, TCacheItem } from './cacheType';
import { IdbMap } from './indexedDB';

const MAXBYTES_MEMORY = 200 * 1024 * 1024; // 200 MB

type GetFileUrl = (key: string) => Promise<string | false>;

interface PreloadProgress {
  loaded: number; // 已缓存对象数
  total: number; // 总对象数
  cachedBytes: number; // 已缓存字节数
  totalBytes: number; // 总字节数
  mode: 'full' | 'stream';
  done: boolean;
  message?: string; // 信息
};

interface CacheStore {
  get: (id: string) => Blob | null | undefined | Promise<Blob | null | undefined>;
  set: (id: string, blob: Blob) => unknown;
  delete: (id: string) => unknown;
  has: (id: string) => boolean | Promise<boolean>;
  values?: () => Iterable<Blob> | Promise<Iterable<Blob>>;
  keys?: () => Iterable<IDBValidKey> | Promise<Iterable<IDBValidKey>>;
}

class BaseCacheController implements ICacheProvider {
  protected itemStore: Map<string, TCacheItem> = new Map();
  protected cacheStore: CacheStore = new Map();
  protected getFileUrl?: GetFileUrl;
  protected maxBytes: number;
  constructor(maxBytes: number = MAXBYTES_MEMORY, getFileUrl?: GetFileUrl) {
    this.maxBytes = maxBytes;
    this.getFileUrl = getFileUrl;
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
  }

  async deleteItem(id: string): Promise<void> {
    this.itemStore.delete(id);
    await this.cacheStore.delete(id);
  }

  async getCache(id: string): Promise<Blob | null> {
    const blob = await this.cacheStore.get(id);
    return blob ?? null;
  }

  async clearExpiredItems(): Promise<void> {
    const now = new Date();
    for (const [id, item] of this.itemStore) {
      if (item.ttl && now.getTime() - item.createdAt.getTime() > item.ttl * 1000) {
        this.itemStore.delete(id);
        await this.cacheStore.delete(id);
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
    if (this.cacheStore.values) {
      const values = await this.cacheStore.values();
      for (const blob of values) {
        total += blob.size;
      }
      return total;
    }
    if (this.cacheStore.keys) {
      const keys = await this.cacheStore.keys();
      for (const key of keys) {
        const blob = await this.cacheStore.get(String(key));
        if (blob) {
          total += blob.size;
        }
      }
    }
    return total;
  }

  protected async isOverMemoryLimit(): Promise<boolean> {
    // 检查前先清理
    await this.clearExpiredItems();
    const currentUsage = await this.getCurrentMemoryUsage();
    return currentUsage > this.maxBytes;
  }

  protected async resolveUrl(item: TCacheItem): Promise<string | null> {
    if (this.getFileUrl) {
      const res = await this.getFileUrl(item.url);
      return res || null;
    }
    return item.url || null;
  }

  async invalidationCache(id: string): Promise<void> {
    await this.cacheStore.delete(id);
  }
}

class MemoryCacheController extends BaseCacheController {
  constructor(maxBytes: number = MAXBYTES_MEMORY, getFileUrl?: GetFileUrl) {
    super(maxBytes, getFileUrl);
  }

  override async preload(
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
      if (await this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'full' });
        continue;
      }
      const resolvedUrl = await this.resolveUrl(item);
      if (!resolvedUrl) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        continue;
      }
      const data = await this.fetchProgressive(resolvedUrl, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        continue;
      }
      await this.cacheStore.set(item.id, data);
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
      if (await this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'stream' });
        continue;
      }
      const resolvedUrl = await this.resolveUrl(item);
      if (!resolvedUrl) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      const data = await this.fetchProgressive(resolvedUrl, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      await this.cacheStore.set(item.id, data);
      this.itemStore.set(item.id, { ...item, lastAccessedAt: new Date(), storeRef: item.id });
      progress.loaded += 1;
      const done = progress.loaded === progress.total;
      yield { ...progress, done };
    }
  }
}

class DiskCacheController extends BaseCacheController {
  // 采用indexedDB的方式实现文件存储
  protected override cacheStore: IdbMap;

  constructor(maxBytes: number = MAXBYTES_MEMORY, getFileUrl?: GetFileUrl) {
    super(maxBytes, getFileUrl);
    this.cacheStore = new IdbMap({ dbName: 'cache', storeName: 'media' });
  }

  override async preload(
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
      if (await this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'full' });
        continue;
      }
      const resolvedUrl = await this.resolveUrl(item);
      if (!resolvedUrl) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        continue;
      }
      const data = await this.fetchProgressive(resolvedUrl, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        continue;
      }
      await this.cacheStore.set(item.id, data);
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
      if (await this.cacheStore.has(item.id)) {
        progress.loaded += 1;
        progress.cachedBytes += item.size;
        progressCallback?.({ ...progress, mode: 'stream' });
        continue;
      }
      const resolvedUrl = await this.resolveUrl(item);
      if (!resolvedUrl) {
        progress.message += `Failed to fetch item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      const data = await this.fetchProgressive(resolvedUrl, progress, progressCallback);
      if (!data) {
        progress.message += `Failed to download item ${item.id}\n`;
        yield { ...progress, done: false };
        continue;
      }
      await this.cacheStore.set(item.id, data);
      this.itemStore.set(item.id, { ...item, lastAccessedAt: new Date(), storeRef: item.id });
      progress.loaded += 1;
      const done = progress.loaded === progress.total;
      yield { ...progress, done };
    }
  }
}

export { MemoryCacheController, DiskCacheController };
export type { GetFileUrl, PreloadProgress };
