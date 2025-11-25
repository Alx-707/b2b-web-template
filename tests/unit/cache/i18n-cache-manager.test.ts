import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/i18n';
import {
  createI18nCacheManager,
  I18nCacheManager,
} from '@/lib/i18n-cache-manager';
import type { CacheConfig } from '@/lib/i18n-cache-types';

// --- Mocks & helpers -------------------------------------------------------

const mockGetCachedMessages = vi.fn();

const { MockLRUCache, mockMetricsCollector } = vi.hoisted(() => {
  const metrics = {
    recordLocaleUsage: vi.fn(),
    recordError: vi.fn(),
    recordTranslationCoverage: vi.fn(),
    getMetrics: vi.fn(() => ({
      cacheHitRate: 0.4,
      loadTime: 120,
      errorRate: 1,
      translationCoverage: 0.5,
      localeUsage: { en: 0, zh: 0 },
    })),
    getDetailedStats: vi.fn(() => ({ events: [] })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    generatePerformanceReport: vi.fn(() => ({ summary: 'ok' })),
    reset: vi.fn(),
  };

  class HoistedLRUCache<T> {
    private store = new Map<string, T>();
    constructor(private readonly config: { maxSize: number }) {}

    getStats() {
      return {
        size: this.store.size,
        totalHits: 0,
        averageAge: 0,
      };
    }

    getDetailedStats() {
      return {
        size: this.store.size,
        totalHits: 0,
        averageAge: 0,
        memoryUsage: this.store.size * 8,
        utilizationRate:
          this.config.maxSize > 0
            ? (this.store.size / this.config.maxSize) * 100
            : 0,
      };
    }

    clear() {
      this.store.clear();
    }

    cleanup() {
      const cleaned = this.store.size > 0 ? 1 : 0;
      const firstKey = this.store.keys().next().value as string | undefined;
      if (firstKey) {
        this.store.delete(firstKey);
      }
      return cleaned;
    }

    set(key: string, value: T) {
      this.store.set(key, value);
    }

    entries() {
      return this.store.entries();
    }

    keys() {
      return this.store.keys();
    }

    has(key: string) {
      return this.store.has(key);
    }

    delete(key: string) {
      return this.store.delete(key);
    }
  }

  return { MockLRUCache: HoistedLRUCache, mockMetricsCollector: metrics };
});

vi.mock('@/lib/i18n-lru-cache', () => ({
  LRUCache: MockLRUCache,
}));

vi.mock('@/lib/i18n-metrics-collector', () => ({
  I18nMetricsCollector: vi.fn(function MockCollector() {
    return mockMetricsCollector;
  }),
}));

vi.mock('@/lib/i18n-performance', () => ({
  getCachedMessages: (...args: unknown[]) =>
    mockGetCachedMessages(...(args as [Locale])),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('I18nCacheManager', () => {
  const managers: I18nCacheManager[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockGetCachedMessages.mockReset();
    managers.length = 0;
  });

  afterEach(() => {
    managers.forEach((manager) => manager.destroy());
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const createManager = (config?: Partial<CacheConfig>) => {
    const manager = new I18nCacheManager({
      maxSize: 5,
      ttl: 10,
      enablePersistence: false,
      storageKey: 'test-cache',
      ...config,
    });
    managers.push(manager);
    return manager;
  };

  it('返回消息并记录 locale/覆盖率指标', async () => {
    mockGetCachedMessages.mockResolvedValueOnce({ greeting: 'hi' });

    const manager = createManager();
    const result = await manager.getMessages('en');

    expect(result).toEqual({ greeting: 'hi' });
    expect(mockMetricsCollector.recordLocaleUsage).toHaveBeenCalledWith('en');
    expect(mockMetricsCollector.recordTranslationCoverage).toHaveBeenCalled();
  });

  it('错误路径会记录错误并抛出', async () => {
    mockGetCachedMessages.mockRejectedValueOnce(new Error('boom'));

    const manager = createI18nCacheManager({
      maxSize: 2,
      ttl: 5,
      enablePersistence: false,
      storageKey: 'err-cache',
    });
    managers.push(manager);

    await expect(manager.getMessages('en' as Locale)).rejects.toThrow('boom');
    expect(mockMetricsCollector.recordError).toHaveBeenCalled();
  });

  it('健康检查在命中率低和缓存接近满载时给出建议', () => {
    mockMetricsCollector.getMetrics.mockReturnValueOnce({
      cacheHitRate: 0.2,
      loadTime: 150,
      errorRate: 6,
      translationCoverage: 0.3,
      localeUsage: { en: 1, zh: 0 },
    });

    const manager = createManager({ maxSize: 2 });
    const internal = manager as unknown as { cache: MockLRUCache<unknown> };
    internal.cache.set('en', { message: 'cached' });
    internal.cache.set('zh', { message: 'cached' });

    const health = manager.performHealthCheck();

    expect(health.isHealthy).toBe(false);
    expect(health.issues.length).toBeGreaterThan(0);
    expect(health.recommendations).toEqual(
      expect.arrayContaining(['考虑增加缓存大小']),
    );
  });

  it('optimizeCache 会清理过期项并在命中率低时预加载', async () => {
    mockMetricsCollector.getMetrics.mockReturnValueOnce({
      cacheHitRate: 0.5,
      loadTime: 50,
      errorRate: 0,
      translationCoverage: 1,
      localeUsage: { en: 0, zh: 0 },
    });
    mockGetCachedMessages.mockResolvedValue({});

    const manager = createManager();
    const internal = manager as unknown as { cache: MockLRUCache<unknown> };
    const cleanupSpy = vi.spyOn(internal.cache, 'cleanup');

    await manager.optimizeCache();

    expect(cleanupSpy).toHaveBeenCalled();
    expect(mockGetCachedMessages).toHaveBeenCalled();
  });

  it('exportCache/importCache 循环数据保持并可删除特定 locale', () => {
    const manager = createManager();
    const internal = manager as unknown as { cache: MockLRUCache<unknown> };
    internal.cache.set('en', { message: 'hello' });

    const exported = manager.exportCache();
    const parsed = JSON.parse(exported);
    expect(parsed.entries).toHaveLength(1);

    const restored = createManager();
    restored.importCache(exported);

    expect(restored.getCachedLocales()).toContain('en');
    expect(restored.deleteMessages('en')).toBe(true);
    expect(restored.getCachedLocales()).not.toContain('en');
  });

  it('getCacheKey/hasMessages 使用命名空间生成键并检查存在性', () => {
    const manager = createManager();
    const internal = manager as unknown as { cache: MockLRUCache<unknown> };
    internal.cache.set('en:marketing', { hero: 'cta' });

    expect(manager.getCacheKey('en', 'marketing')).toBe('en:marketing');
    expect(manager.hasMessages('en', 'marketing')).toBe(true);
  });

  it('预加载/批量获取/调试接口覆盖更多分支与错误路径', async () => {
    mockGetCachedMessages
      .mockResolvedValueOnce({ locale: 'en' })
      .mockResolvedValueOnce({ locale: 'zh' })
      .mockRejectedValueOnce(new Error('preload-fail'))
      .mockResolvedValue({ locale: 'cached' });

    const manager = createManager({ maxSize: 3 });

    await expect(manager.preloadMessages('en' as Locale)).resolves.toEqual({
      locale: 'en',
    });

    await manager.preloadAllMessages();
    expect(mockMetricsCollector.recordError).toHaveBeenCalled();

    const batchResult = await manager.batchGetMessages([
      'en',
      'zh',
    ] as Locale[]);
    expect(batchResult.get('en')).toBeDefined();

    manager.warmupCache();
    vi.runOnlyPendingTimers();

    expect(manager.getCacheStats()).toHaveProperty('size');
    expect(manager.getDetailedStats()).toHaveProperty('config');

    const internal = manager as unknown as { cache: MockLRUCache<unknown> };
    internal.cache.set('en', { ready: true });
    expect(manager.getCachedLocales()).toContain('en');
    expect(manager.deleteMessages('en')).toBe(true);

    await manager.preloadMultipleLocales(['en', 'zh'] as Locale[]);
    expect(manager.getMetrics()).toBeDefined();
    expect(manager.getDebugInfo()).toHaveProperty('memoryUsage');

    const onEvent = vi.fn();
    manager.addEventListener('*', onEvent);
    manager.removeEventListener('*', onEvent);

    manager.resetMetrics();
    manager.clearCache();
    expect(manager.getCacheSize()).toBe(0);

    expect(manager.isPreloading()).toBe(false);
    expect(manager.getPreloadProgress()).toBe(100);
    manager.stopPreloading();

    manager.updatePreloadConfig({
      preload: true,
    } as unknown as Partial<CacheConfig>);
    manager.updateConfig({ ttl: 20 });
    expect(manager.generatePerformanceReport()).toEqual({ summary: 'ok' });

    expect(() => manager.importCache('not-json')).toThrow(
      'Invalid cache data format',
    );
  });
});
