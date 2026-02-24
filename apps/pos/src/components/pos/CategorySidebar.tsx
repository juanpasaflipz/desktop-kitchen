import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../BrandLogo';
import { MenuCategory } from '../../types';

interface CategorySidebarProps {
  categories: MenuCategory[];
  selectedCategory: number | 'all';
  onSelectCategory: (id: number | 'all') => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('pos');

  return (
    <div className="hidden lg:flex w-48 bg-neutral-900 border-r border-neutral-800 flex-col">
      <div className="bg-neutral-950 p-4 text-center border-b border-neutral-800">
        <BrandLogo className="h-8 mx-auto mb-1" />
        <p className="font-bold text-xs text-neutral-400 tracking-tight">{t('header.categories')}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full py-4 px-4 text-lg font-semibold border-b border-neutral-800 transition-all touch-manipulation ${
            selectedCategory === 'all' ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          {t('header.allItems')}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full py-4 px-4 text-lg font-semibold border-b border-neutral-800 transition-all touch-manipulation ${
              selectedCategory === cat.id ? 'bg-brand-600 text-white' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="border-t border-neutral-800 p-3 space-y-2">
        <button
          onClick={() => navigate('/admin')}
          className="w-full py-2 bg-neutral-800 text-neutral-300 text-sm font-bold rounded hover:bg-neutral-700 transition-all border border-neutral-700"
        >
          {t('common:buttons.admin')}
        </button>
        <button
          onClick={() => navigate('/kitchen')}
          className="w-full py-2 bg-neutral-800 text-neutral-300 text-sm font-bold rounded hover:bg-neutral-700 transition-all border border-neutral-700"
        >
          {t('common:buttons.kitchen')}
        </button>
      </div>
    </div>
  );
}
