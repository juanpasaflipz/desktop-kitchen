import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GrainOverlay, BrandView, BrandTransition } from '../components/menu-board';
import type { ComboData } from '../components/menu-board/ComboHero';

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

interface MenuBoardResponse {
  brands: BrandData[];
  combos: ComboData[];
  lastUpdated: string;
}

const ROTATE_INTERVAL = 30_000; // 30s between brands
const REFETCH_INTERVAL = 5 * 60_000; // 5 min
const CURSOR_HIDE_DELAY = 3_000; // 3s

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const MenuBoardScreen: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursorTimer = useRef<number | null>(null);
  const fontsLoaded = useRef(false);

  // Fetch menu data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/menu-board/data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MenuBoardResponse = await res.json();
      setBrands(data.brands);
      setCombos(data.combos || []);
      setError(null);

      // Load Google Fonts if Ensenada 101 is present
      if (!fontsLoaded.current && data.brands.some(b => b.slug === 'ensenada-101')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
        fontsLoaded.current = true;
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + periodic refetch
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFETCH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  // Auto-rotate brands
  useEffect(() => {
    if (brands.length <= 1) return;
    const id = setInterval(() => {
      setActiveBrandIndex(prev => (prev + 1) % brands.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, [brands.length]);

  // Orientation detection
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Hide cursor after inactivity
  useEffect(() => {
    const resetCursor = () => {
      setCursorHidden(false);
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
      cursorTimer.current = window.setTimeout(() => setCursorHidden(true), CURSOR_HIDE_DELAY);
    };
    resetCursor();
    window.addEventListener('mousemove', resetCursor);
    window.addEventListener('touchstart', resetCursor);
    return () => {
      window.removeEventListener('mousemove', resetCursor);
      window.removeEventListener('touchstart', resetCursor);
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
    };
  }, []);

  // Hide scrollbars globally
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .menu-board-root, .menu-board-root * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .menu-board-root ::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white/30 text-lg animate-pulse">Loading menu...</div>
      </div>
    );
  }

  if (error || brands.length === 0) {
    return (
      <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white/30 text-lg">{error || 'No menu data available'}</div>
      </div>
    );
  }

  return (
    <div
      className={`menu-board-root w-screen h-screen bg-neutral-950 overflow-hidden relative ${cursorHidden ? 'cursor-none' : ''}`}
    >
      <GrainOverlay />

      {brands.map((brand, i) => (
        <BrandTransition key={brand.id} isActive={i === activeBrandIndex}>
          <BrandView brand={brand} combos={combos} isPortrait={isPortrait} />
        </BrandTransition>
      ))}

      {/* Brand indicator dots */}
      {brands.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {brands.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBrandIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === activeBrandIndex ? 'bg-white/60 scale-125' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuBoardScreen;
