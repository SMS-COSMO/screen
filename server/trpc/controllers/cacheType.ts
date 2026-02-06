interface TCacheItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
  size: number;
  lastAccessedAt: Date;
  // 要么存内存要么存磁盘
  store: 'disk' | 'memory';
  ttl?: number; // time to live in seconds
  storeRef?: string; // 本地磁盘路径或内存存储的键
}

interface ICacheProvider {
  getItem: (id: string) => Promise<TCacheItem | null>;
  getCache: (id: string) => Promise<Blob | null>;
  setItem: (item: TCacheItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearExpiredItems: () => Promise<void>;
  preload: (method: any, ...args: any[]) => Promise<any>;
  invalidationCache: (...args: any) => Promise<any>;
}

export type { TCacheItem, ICacheProvider };
