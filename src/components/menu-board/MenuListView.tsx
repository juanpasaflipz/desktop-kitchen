import React from 'react';
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

interface MenuListViewProps {
  brand: BrandData;
  combos: ComboData[];
  isPortrait: boolean;
}

// ── Balance categories into columns ────────────────────────────────────────

interface ColumnData {
  categories: CategoryData[];
  itemCount: number;
}

function distributeColumns(categories: CategoryData[], numCols: number): ColumnData[] {
  const columns: ColumnData[] = Array.from({ length: numCols }, () => ({
    categories: [],
    itemCount: 0,
  }));

  // Sort categories largest-first for better packing
  const sorted = [...categories].sort((a, b) => b.items.length - a.items.length);

  for (const cat of sorted) {
    // Place in the column with fewest items
    let minIdx = 0;
    for (let i = 1; i < columns.length; i++) {
      if (columns[i].itemCount < columns[minIdx].itemCount) minIdx = i;
    }
    columns[minIdx].categories.push(cat);
    columns[minIdx].itemCount += cat.items.length + 1; // +1 for header
  }

  return columns;
}

// ── Item row: name ··· $price ──────────────────────────────────────────────

const ListItem: React.FC<{ name: string; price: number; isBold?: boolean }> = ({ name, price, isBold }) => (
  <div className={`flex items-baseline gap-1 py-[3px] px-1 ${isBold ? 'opacity-100' : 'opacity-85'}`}>
    <span className={`text-[13px] text-white/90 truncate shrink-0 max-w-[72%] ${isBold ? 'font-bold' : ''}`}>
      {name}
    </span>
    <span className="flex-1 border-b border-dotted border-white/10 min-w-[8px] translate-y-[-3px]" />
    <span
      className={`text-[13px] shrink-0 ${isBold ? 'font-bold' : 'font-semibold'}`}
      style={{ color: 'var(--mb-secondary, var(--mb-primary))' }}
    >
      ${price}
    </span>
  </div>
);

// ── Category block ─────────────────────────────────────────────────────────

const CategoryBlock: React.FC<{ category: CategoryData }> = ({ category }) => (
  <div className="mb-3">
    <div className="flex items-center gap-2 mb-1 px-1">
      <div className="w-1 h-3.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--mb-primary)' }} />
      <span
        className="text-[11px] font-black uppercase tracking-[0.2em]"
        style={{ color: 'var(--mb-primary)', fontFamily: 'var(--mb-font-heading, inherit)' }}
      >
        {category.name}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--mb-primary)', opacity: 0.2 }} />
    </div>
    {category.items.map(item => (
      <ListItem key={item.id} name={item.name} price={item.price} />
    ))}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────

const MenuListView: React.FC<MenuListViewProps> = ({ brand, combos, isPortrait }) => {
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

  // All categories including combos (as a virtual category)
  const allCategories: CategoryData[] = [
    ...brand.categories.filter(c => c.name.toLowerCase() !== 'combos'),
  ];

  // Add combos as a category if present
  if (combos.length > 0) {
    allCategories.push({
      id: -1,
      name: 'Combos',
      items: combos.map(c => ({
        id: c.id + 100000,
        name: c.name,
        price: c.comboPrice,
        badges: [],
      })),
    });
  }

  const numCols = isPortrait ? 2 : 3;
  const columns = distributeColumns(allCategories, numCols);

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ ...cssVars, backgroundColor: theme.darkBg, fontFamily: `var(--mb-font-body)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
          <h1
            className="text-lg font-black uppercase tracking-wider text-white"
            style={{ fontFamily: `var(--mb-font-heading)` }}
          >
            {brand.name}
          </h1>
          <span className="text-[10px] text-white/25 uppercase tracking-widest ml-2">
            Full Menu
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/30">
          <MenuBoardClock />
          <span className="text-[9px] uppercase tracking-widest">MXN</span>
        </div>
      </div>

      {/* Multi-column list */}
      <div
        className="flex-1 overflow-hidden px-6 py-4 flex min-h-0"
        style={{ gap: isPortrait ? 16 : 32 }}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
            {col.categories.map(cat => (
              <CategoryBlock key={cat.id} category={cat} />
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center px-5 py-1.5 border-t border-white/[0.06] text-white/30 shrink-0">
        <span className="text-[9px] uppercase tracking-widest">Precios en MXN · IVA incluido</span>
      </div>
    </div>
  );
};

export default MenuListView;
