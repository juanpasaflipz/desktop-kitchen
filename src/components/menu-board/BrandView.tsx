import React from 'react';
import CategorySection from './CategorySection';
import ComboHero from './ComboHero';
import MenuBoardClock from './MenuBoardClock';
import type { ComboData } from './ComboHero';

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

interface BrandTheme {
  primaryColor: string;
  secondaryColor?: string;
  fontFamily?: string;
  darkBg: string;
}

interface BrandData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  theme: BrandTheme;
  categories: CategoryData[];
}

interface BrandViewProps {
  brand: BrandData;
  combos: ComboData[];
  isPortrait: boolean;
}

/**
 * Find a representative hero image for a combo by looking at its slot categories
 * and grabbing the first image from matching brand categories.
 */
function getComboHeroImage(combo: ComboData, categories: CategoryData[]): string | null {
  // First try slot item images
  for (const slot of combo.slots) {
    if (slot.itemImage) return slot.itemImage;
  }
  // Fall back to first image from the combo's category slots
  for (const slot of combo.slots) {
    if (slot.categoryId) {
      const cat = categories.find(c => c.id === slot.categoryId);
      if (cat) {
        for (const item of cat.items) {
          if (item.imageUrl) return item.imageUrl;
        }
      }
    }
  }
  return null;
}

const BrandView: React.FC<BrandViewProps> = ({ brand, combos, isPortrait }) => {
  const { theme } = brand;
  const fonts = theme.fontFamily || 'system-ui, -apple-system, sans-serif';
  const fontParts = fonts.split(',').map(f => f.trim().replace(/'/g, ''));
  const headingFont = fontParts[0] || 'system-ui';
  const bodyFont = fontParts[1] || fontParts[0] || 'system-ui';

  const cssVars = {
    '--mb-primary': theme.primaryColor,
    '--mb-secondary': theme.secondaryColor || theme.primaryColor,
    '--mb-dark-bg': theme.darkBg,
    '--mb-font': fonts,
    '--mb-font-heading': `'${headingFont}', sans-serif`,
    '--mb-font-body': `'${bodyFont}', sans-serif`,
  } as React.CSSProperties;

  // Filter out the "Combos" category from the grid (we show them as heroes)
  const nonComboCategories = brand.categories.filter(
    c => c.name.toLowerCase() !== 'combos'
  );

  if (isPortrait) {
    return (
      <div
        className="w-full h-full flex flex-col overflow-hidden"
        style={{ ...cssVars, backgroundColor: theme.darkBg, fontFamily: `var(--mb-font-body)` }}
      >
        {/* Slim top header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className="w-1.5 h-8 rounded-full"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <h1
              className="text-lg font-black uppercase tracking-wide text-white"
              style={{ fontFamily: `var(--mb-font-heading)` }}
            >
              {brand.name}
            </h1>
          </div>
          <MenuBoardClock />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Combo heroes */}
          {combos.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {combos.map(combo => (
                <ComboHero
                  key={combo.id}
                  combo={combo}
                  isPortrait
                  heroImage={getComboHeroImage(combo, brand.categories)}
                />
              ))}
            </div>
          )}

          {/* Category sections */}
          {nonComboCategories.map(cat => (
            <CategorySection key={cat.id} name={cat.name} items={cat.items} isPortrait />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center px-5 py-1.5 border-t border-white/[0.06] text-white/30">
          <span className="text-[9px] uppercase tracking-widest">Precios en MXN</span>
        </div>
      </div>
    );
  }

  // Landscape: hero top + grid below, no sidebar
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ ...cssVars, backgroundColor: theme.darkBg, fontFamily: `var(--mb-font-body)` }}
    >
      {/* Slim top bar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-7 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <h1
            className="text-lg font-black uppercase tracking-wider text-white"
            style={{ fontFamily: `var(--mb-font-heading)` }}
          >
            {brand.name}
          </h1>
          {brand.description && (
            <span className="text-[10px] text-white/30 uppercase tracking-widest ml-2 hidden sm:inline">
              {brand.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-white/30">
          <MenuBoardClock />
          <span className="text-[9px] uppercase tracking-widest">MXN</span>
        </div>
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Combo heroes — 2-up row */}
        {combos.length > 0 && (
          <div className="flex gap-4 mb-6">
            {combos.map(combo => (
              <ComboHero
                key={combo.id}
                combo={combo}
                isPortrait={false}
                heroImage={getComboHeroImage(combo, brand.categories)}
              />
            ))}
          </div>
        )}

        {/* Category grids */}
        {nonComboCategories.map(cat => (
          <CategorySection key={cat.id} name={cat.name} items={cat.items} isPortrait={false} />
        ))}
      </div>
    </div>
  );
};

export default BrandView;
