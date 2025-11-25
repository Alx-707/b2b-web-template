import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageManager } from '@/lib/locale-storage-local';

describe('LocalStorageManager', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    const storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    };

    Object.defineProperty(globalThis, 'window', {
      value: {},
      writable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('set/get 支持 JSON 存储并在损坏时返回 null', () => {
    LocalStorageManager.set('foo', { bar: 1 });
    expect(LocalStorageManager.get<{ bar: number }>('foo')).toEqual({ bar: 1 });

    store['broken'] = '{invalid json';
    expect(LocalStorageManager.get('broken')).toBeNull();
  });

  it('exists 在异常时返回 false，并能删除与清空数据', () => {
    expect(LocalStorageManager.exists('missing')).toBe(false);

    LocalStorageManager.set('keep', 'value');
    expect(LocalStorageManager.exists('keep')).toBe(true);

    LocalStorageManager.remove('keep');
    expect(LocalStorageManager.exists('keep')).toBe(false);

    LocalStorageManager.set('a', '1');
    LocalStorageManager.set('b', '2');
    LocalStorageManager.clear();
    expect(LocalStorageManager.exists('a')).toBe(false);
  });

  it('getUsageSize/isAvailable/isNearLimit 使用存储大小估算', () => {
    LocalStorageManager.set('sizeKey', '12345');
    const usage = LocalStorageManager.getUsageSize();
    expect(usage).toBeGreaterThan(0);

    expect(LocalStorageManager.isAvailable()).toBe(true);

    const usageSpy = vi
      .spyOn(LocalStorageManager, 'getUsageSize')
      .mockReturnValue(4.5 * 1024 * 1024);
    expect(LocalStorageManager.getRemainingSpace()).toBeGreaterThan(0);
    expect(LocalStorageManager.isNearLimit()).toBe(true);
    usageSpy.mockRestore();
  });

  it('isAvailable 在 setItem 抛错时返回 false', () => {
    const failingStorage = {
      ...localStorage,
      setItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    Object.defineProperty(globalThis, 'localStorage', {
      value: failingStorage,
      writable: true,
    });

    expect(LocalStorageManager.isAvailable()).toBe(false);
  });

  it('getAll/getItemSize 在多项记录与缺失 window 时安全返回', () => {
    LocalStorageManager.set('foo', 'bar');
    LocalStorageManager.set('baz', { z: 1 });

    const all = LocalStorageManager.getAll();
    expect(all).toMatchObject({ foo: 'bar', baz: { z: 1 } });

    const size = LocalStorageManager.getItemSize('foo');
    expect(size).toBeGreaterThan(0);

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
    });
    expect(LocalStorageManager.getItemSize('foo')).toBe(0);
  });

  it('getRemainingSpace 在不可用存储下返回 0，自定义阈值触发 near-limit', () => {
    const originalStorage = localStorage;

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        ...originalStorage,
        setItem: () => {
          throw new Error('blocked');
        },
      },
      writable: true,
    });
    expect(LocalStorageManager.getRemainingSpace()).toBe(0);

    Object.defineProperty(globalThis, 'localStorage', {
      value: originalStorage,
      writable: true,
    });

    LocalStorageManager.set('heavy', 'x'.repeat(1024));
    const nearLimit = LocalStorageManager.isNearLimit(0.0001);
    expect(nearLimit).toBe(true);
  });
});
