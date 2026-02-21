import { useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Badge {
  type: string;
  label: string;
}

interface MenuItemData {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string | null;
  badges: Badge[];
}

interface CategoryData {
  id: number;
  name: string;
  items: MenuItemData[];
}

export type LayoutMode = 'standard' | 'compact';
export type CardVariant = 'hero' | 'standard' | 'compact' | 'mini';

export interface LayoutPlan {
  mode: LayoutMode;
  /** IDs of items that should get featured/hero treatment (standard mode only) */
  featuredIds: Set<number>;
  /** Total available height for the menu grid area (px) */
  gridHeight: number;
  /** Combo row height (px) */
  comboRowHeight: number;
  /** Columns for standard mode grid */
  columns: number;
}

interface UseMenuLayoutParams {
  categories: CategoryData[];
  viewportHeight: number;
  viewportWidth: number;
  hasCombos: boolean;
  isPortrait: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const HEADER_H = 48; // top bar approx
const FOOTER_H = 28; // portrait footer
const CONTENT_PAD = 20; // py-2 + gap-2 in BrandView content area

// ── Featured item selection ────────────────────────────────────────────────

function selectFeaturedItems(categories: CategoryData[], maxFeatured: number): Set<number> {
  const featured = new Set<number>();

  // Priority 1: bestseller badge + has image
  for (const cat of categories) {
    for (const item of cat.items) {
      if (featured.size >= maxFeatured) return featured;
      if (item.badges.some(b => b.type === 'bestseller') && item.imageUrl) {
        featured.add(item.id);
      }
    }
  }

  // Priority 2: popular-now badge + has image
  for (const cat of categories) {
    for (const item of cat.items) {
      if (featured.size >= maxFeatured) return featured;
      if (item.badges.some(b => b.type === 'popular-now') && item.imageUrl && !featured.has(item.id)) {
        featured.add(item.id);
      }
    }
  }

  // Priority 3: first item with image per category
  for (const cat of categories) {
    if (featured.size >= maxFeatured) return featured;
    const withImage = cat.items.find(i => i.imageUrl && !featured.has(i.id));
    if (withImage) featured.add(withImage.id);
  }

  return featured;
}

// ── Main hook ──────────────────────────────────────────────────────────────

export function useMenuLayout({
  categories,
  viewportHeight,
  viewportWidth,
  hasCombos,
  isPortrait,
}: UseMenuLayoutParams): LayoutPlan {
  return useMemo(() => {
    const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

    // Mode: ≤20 items get photo cards (standard), >20 get compact rows
    const mode: LayoutMode = totalItems <= 20 ? 'standard' : 'compact';

    // Combo row: ~16% of viewport, capped
    const comboRowHeight = hasCombos
      ? Math.min(Math.round(viewportHeight * 0.16), isPortrait ? 130 : 170)
      : 0;

    // Available height for the grid
    const footerH = isPortrait ? FOOTER_H : 0;
    const comboGap = hasCombos ? 8 : 0;
    const gridHeight = Math.max(100, viewportHeight - HEADER_H - footerH - comboRowHeight - comboGap - CONTENT_PAD);

    // Featured items for standard mode
    const featuredIds = mode === 'standard' ? selectFeaturedItems(categories, 3) : new Set<number>();

    // Columns for standard mode
    const columns = isPortrait ? 3 : 4;

    return { mode, featuredIds, gridHeight, comboRowHeight, columns };
  }, [categories, viewportHeight, viewportWidth, hasCombos, isPortrait]);
}
