import { offlineDb, type CachedMenuData } from './offlineDb';
import {
  getCategories,
  getMenuItems,
  getItemsWithModifiers,
  getPopularItems,
  getCategorySuggestedOrder,
  getCombos,
  getOrderTemplates,
} from '../api';
import type { MenuCategory, MenuItem, ComboDefinition, OrderTemplate } from '../types';

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function cacheGet<T>(key: string): Promise<T | null> {
  const entry = await offlineDb.menuCache.get(key);
  if (!entry) return null;
  // Still return even if stale — caller decides freshness
  return entry.data as T;
}

async function cacheSet(key: string, data: any): Promise<void> {
  const entry: CachedMenuData = { key, data, updatedAt: Date.now() };
  await offlineDb.menuCache.put(entry);
}

/**
 * Cache-first wrapper: try server, fall back to IndexedDB.
 * First launch must be online (no cache = error).
 */
async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const fresh = await fetcher();
    await cacheSet(key, fresh);
    return fresh;
  } catch {
    // Server failed — read from cache
    const cached = await cacheGet<T>(key);
    if (cached !== null) return cached;
    throw new Error(`No cached data for "${key}" — connect to internet for initial setup`);
  }
}

/* ==================== Cached API Functions ==================== */

export function getCachedCategories(): Promise<MenuCategory[]> {
  return withCache('categories', () => getCategories());
}

export function getCachedMenuItems(): Promise<MenuItem[]> {
  return withCache('menuItems', () => getMenuItems());
}

export function getCachedItemsWithModifiers(): Promise<{ itemIds: number[] }> {
  return withCache('itemsWithModifiers', () => getItemsWithModifiers());
}

export function getCachedPopularItems(limit: number = 8): Promise<MenuItem[]> {
  return withCache('popularItems', () => getPopularItems(limit));
}

export function getCachedCategorySuggestedOrder(): Promise<number[]> {
  return withCache('categorySuggestedOrder', () => getCategorySuggestedOrder());
}

export function getCachedCombos(): Promise<ComboDefinition[]> {
  return withCache('combos', () => getCombos());
}

export function getCachedOrderTemplates(): Promise<OrderTemplate[]> {
  return withCache('orderTemplates', () => getOrderTemplates());
}
