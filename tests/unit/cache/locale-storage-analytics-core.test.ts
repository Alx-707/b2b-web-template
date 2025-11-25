import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateHealthCheck,
  calculateStorageEfficiency,
  calculateStorageStats,
  getStorageStats,
  performHealthCheck,
} from '@/lib/locale-storage-analytics-core';

const mockGet = vi.fn();
const mockEstimateSize = vi.fn();

vi.mock('@/lib/locale-storage-local', () => ({
  LocalStorageManager: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock('@/lib/locale-storage-types', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/locale-storage-types')
  >('@/lib/locale-storage-types');

  return {
    ...actual,
    estimateStorageSize: (...args: unknown[]) => mockEstimateSize(...args),
  };
});

describe('locale-storage-analytics-core', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    mockGet.mockReset();
    mockEstimateSize.mockReset();

    // 提供可用的存储环境，避免可用性检测抛错
    const storage: Record<string, string> = {};
    const createStore = () => ({
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      key: (index: number) => Object.keys(storage)[index] ?? null,
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      },
      get length() {
        return Object.keys(storage).length;
      },
    });

    Object.defineProperty(globalThis, 'window', {
      value: { indexedDB: {} },
      writable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStore(),
      writable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: createStore(),
      writable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const setupStoredData = (lastUpdatedOffsetMs: number, historyLength = 2) => {
    const now = Date.now();
    const timestamp = now - lastUpdatedOffsetMs;
    mockGet.mockImplementation((key: string) => {
      if (key === 'user-locale-preference') {
        return { locale: 'en', lastUpdated: timestamp };
      }
      if (key === 'locale-detection-history') {
        return {
          history: Array.from({ length: historyLength }).map((_, index) => ({
            detectedLocale: index % 2 === 0 ? 'en' : 'zh',
            timestamp: timestamp - index * 1000,
          })),
          lastUpdated: timestamp,
        };
      }
      if (key === 'fallback-locale') {
        return { value: 'en', lastUpdated: timestamp };
      }
      return null;
    });

    mockEstimateSize.mockImplementation((value) => (value ? 1_500_000 : 0));
  };

  it('计算存储统计数据并返回包装结果', () => {
    setupStoredData(24 * 60 * 60 * 1000, 3);

    const stats = calculateStorageStats();

    expect(stats.totalEntries).toBe(3);
    expect(stats.totalSize).toBe(4_500_000);
    expect(stats.historyStats.totalEntries).toBe(3);
    expect(stats.historyStats.uniqueLocales).toBeGreaterThanOrEqual(1);

    const wrapped = getStorageStats();
    expect(wrapped.success).toBe(true);
    expect(wrapped.data?.totalEntries).toBe(3);
    expect(wrapped.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('健康检查在数据陈旧/容量过大/历史过多时给出问题列表', () => {
    // 让数据滞后 10 天 + 1200 条记录，触发 freshness/size/history 问题
    setupStoredData(10 * 24 * 60 * 60 * 1000, 1_200);

    const health = calculateHealthCheck();

    expect(health.isHealthy).toBe(false);
    expect(health.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['数据过期', '历史记录过多', '存储空间使用过多']),
    );
    expect(health.storage.utilization).toBeGreaterThan(0);
  });

  it('performHealthCheck 包装健康检查结果并处理异常', () => {
    setupStoredData(2 * 60 * 60 * 1000, 10);
    const success = performHealthCheck();
    expect(success.success).toBe(true);

    mockGet.mockImplementation(() => {
      throw new Error('storage error');
    });
    const failure = performHealthCheck();
    expect(failure.success).toBe(false);
    expect(failure.error).toBe('storage error');
  });

  it('calculateStorageEfficiency 在极端输入下保持 0-1 范围', () => {
    const efficiency = calculateStorageEfficiency({
      totalEntries: 3,
      totalSize: 10_000_000,
      lastAccessed: Date.now(),
      lastModified: Date.now(),
      accessCount: 0,
      errorCount: 0,
      freshness: 0.1,
      hasOverride: false,
      historyStats: {
        totalEntries: 300,
        uniqueLocales: 3,
        oldestEntry: 0,
        newestEntry: 0,
      },
    });

    expect(efficiency).toBeGreaterThanOrEqual(0);
    expect(efficiency).toBeLessThanOrEqual(1);
  });
});
