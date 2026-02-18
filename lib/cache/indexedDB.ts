// IndexedDB helper: minimal Map-like API for browser environments.

export interface IndexedDbOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
}

export interface IndexedDbCacheOptions extends IndexedDbOptions {
  ttlMs?: number;
}

const DEFAULT_DB_NAME = 'app-cache';
const DEFAULT_STORE_NAME = 'kv';
const DEFAULT_VERSION = 1;

interface StoredValue<T> {
  value: T;
  expiresAt: number | null;
}

function ensureBrowser() {
  if (typeof indexedDB === 'undefined') {
    throw new TypeError('indexedDB is not available in this environment');
  }
}

export function openIndexedDB(options: IndexedDbOptions = {}) {
  ensureBrowser();
  const dbName = options.dbName ?? DEFAULT_DB_NAME;
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  const version = options.version ?? DEFAULT_VERSION;

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = fn(store);

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet<T = unknown>(
  key: IDBValidKey,
  options: IndexedDbOptions = {},
) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  const raw = await withStore<StoredValue<T> | T | undefined>(
    db,
    storeName,
    'readonly',
    store => store.get(key),
  );
  db.close();
  if (raw && typeof raw === 'object' && 'value' in raw && 'expiresAt' in raw) {
    const wrapped = raw as StoredValue<T>;
    if (wrapped.expiresAt !== null && Date.now() > wrapped.expiresAt) {
      await idbDelete(key, options);
      return null;
    }
    return wrapped.value;
  }
  return raw as T | null;
}

export async function idbSet(
  key: IDBValidKey,
  value: unknown,
  options: IndexedDbCacheOptions = {},
) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  const ttlMs = options.ttlMs;
  const payload: StoredValue<unknown> = {
    value,
    expiresAt: typeof ttlMs === 'number' ? Date.now() + ttlMs : null,
  };
  await withStore(db, storeName, 'readwrite', store => store.put(payload, key));
  db.close();
}

export async function idbDelete(
  key: IDBValidKey,
  options: IndexedDbOptions = {},
) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  await withStore(db, storeName, 'readwrite', store => store.delete(key));
  db.close();
}

export async function idbClear(options: IndexedDbOptions = {}) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  await withStore(db, storeName, 'readwrite', store => store.clear());
  db.close();
}

export async function idbKeys(options: IndexedDbOptions = {}) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  const keys = await withStore<IDBValidKey[]>(db, storeName, 'readonly', store => store.getAllKeys());
  db.close();
  return keys;
}

async function idbHas(key: IDBValidKey, options: IndexedDbOptions = {}) {
  const db = await openIndexedDB(options);
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;
  const res = withStore<IDBValidKey | undefined>(db, storeName, 'readonly', store => store.getKey(key));
  return (await res) !== undefined;
}

class IdbMap {
  // 对于每一个Map, 要求针对一个数据库
  private options: IndexedDbOptions;
  constructor(options: IndexedDbOptions = {}) {
    this.options = options;
  }

  get(id: string): Promise<Blob | null> {
    return idbGet<Blob | null>(id, this.options);
  }

  set(id: string, blob: Blob): Promise<void> {
    return idbSet(id, blob, this.options);
  }

  delete(id: string): Promise<void> {
    return idbDelete(id, this.options);
  }

  keys(): Promise<IDBValidKey[]> {
    return idbKeys(this.options);
  }

  clear(): Promise<void> {
    return idbClear(this.options);
  }

  has(id: string): Promise<boolean> {
    return idbHas(id, this.options);
  }

  async forEach(callback: (id: string, blob: Blob) => void): Promise<void> {
    const keys = await this.keys();
    for (const key of keys) {
      const value = await this.get(key as string);
      if (value !== null) {
        callback(key as string, value);
      }
    }
  }

  async values(): Promise<Blob[]> {
    const values: Blob[] = [];
    await this.forEach((_, blob) => values.push(blob));
    return values;
  }

  async entries(): Promise<[string, Blob][]> {
    const entries: [string, Blob][] = [];
    await this.forEach((id, blob) => entries.push([id, blob]));
    return entries;
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<[string, Blob | null]> {
    const keys = await this.keys();
    for (const key of keys) {
      const value = await this.get(key as string);
      yield [key as string, value];
    }
  }

  [Symbol.toStringTag](): string {
    return `IdbMap<${this.options.dbName ?? DEFAULT_DB_NAME}:${this.options.storeName ?? DEFAULT_STORE_NAME}>`;
  }
}

export { IdbMap };
