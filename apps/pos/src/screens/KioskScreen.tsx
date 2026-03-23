import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';
import {
  getCustomerOrderSettings,
  placeCustomerOrder,
  getCustomerOrderStatus,
  createCustomerPaymentIntent,
  confirmCustomerPayment,
  type CustomerOrderItem,
  type CustomerOrderStatus,
} from '../api/customerOrder';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShoppingBag, Plus, Minus, ArrowLeft, Loader2, Check, ChefHat, Bell, X } from 'lucide-react';

/* ==================== Capacitor API base ==================== */

const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();

function apiBase(): string {
  if (isCapacitor) {
    const tenantSlug = localStorage.getItem('tenant_id');
    if (tenantSlug) return `https://${tenantSlug}.desktop.kitchen/api`;
    return 'https://pos.desktop.kitchen/api';
  }
  return '/api';
}

/* ==================== Stripe setup ==================== */

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

/* ==================== Types ==================== */

interface MenuItemData {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string | null;
}

interface CategoryData {
  id: number;
  name: string;
  items: MenuItemData[];
}

interface BrandData {
  id: number;
  name: string;
  categories: CategoryData[];
  theme: { primaryColor: string };
}

interface ModifierData {
  id: number;
  name: string;
  price_adjustment: number;
}

interface ModifierGroupData {
  id: number;
  name: string;
  selection_type: 'single' | 'multi';
  required: boolean;
  min_selections: number;
  max_selections: number;
  modifiers?: ModifierData[];
}

interface CartItem {
  cartId: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  modifiers: ModifierData[];
}

/* ==================== localStorage helpers ==================== */

const ACTIVE_ORDER_KEY = 'kiosk_active_order';

function saveActiveOrder(orderId: number) {
  try {
    localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify({ orderId, ts: Date.now() }));
  } catch { /* ignore */ }
}

function loadActiveOrder(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 4 * 60 * 60 * 1000) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      return null;
    }
    return data.orderId;
  } catch {
    return null;
  }
}

function clearActiveOrder() {
  try { localStorage.removeItem(ACTIVE_ORDER_KEY); } catch { /* ignore */ }
}

/* ==================== Cart Reducer ==================== */

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; cartId: string }
  | { type: 'UPDATE_QTY'; cartId: string; quantity: number }
  | { type: 'CLEAR' };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.item];
    case 'REMOVE_ITEM':
      return state.filter(i => i.cartId !== action.cartId);
    case 'UPDATE_QTY':
      return action.quantity <= 0
        ? state.filter(i => i.cartId !== action.cartId)
        : state.map(i => i.cartId === action.cartId ? { ...i, quantity: action.quantity } : i);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

/* ==================== Icon Map for Modifier Groups ==================== */

const MODIFIER_ICON_MAP: Record<string, string> = {
  size: '📏', tamaño: '📏', tamano: '📏',
  milk: '🥛', leche: '🥛',
  sugar: '🍬', azúcar: '🍬', azucar: '🍬', endulzante: '🍬',
  temperature: '🌡️', temperatura: '🌡️',
  topping: '🍫', toppings: '🍫',
  extra: '➕', extras: '➕',
  flavor: '🍓', sabor: '🍓',
  bread: '🍞', pan: '🍞',
  sauce: '🫙', salsa: '🫙',
  protein: '🥩', proteína: '🥩', proteina: '🥩',
  cheese: '🧀', queso: '🧀',
  drink: '🥤', bebida: '🥤',
  side: '🥗', guarnición: '🥗', guarnicion: '🥗',
  spice: '🌶️', picante: '🌶️',
};

function getGroupIcon(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(MODIFIER_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

/* ==================== Category Icon Map ==================== */

const CATEGORY_ICON_MAP: Record<string, string> = {
  burrito: '🌯', burritos: '🌯',
  bebida: '🥤', bebidas: '🥤', drinks: '🥤', refresco: '🥤', refrescos: '🥤',
  coffee: '☕', café: '☕', cafe: '☕',
  comida: '🍽️', food: '🍽️', comer: '🍽️', platos: '🍽️', platillos: '🍽️',
  combo: '📦', combos: '📦', paquete: '📦', paquetes: '📦',
  postre: '🍰', postres: '🍰', dessert: '🍰', desserts: '🍰',
  snack: '🍿', snacks: '🍿', botana: '🍿', botanas: '🍿',
  desayuno: '🥞', breakfast: '🥞',
  ensalada: '🥗', ensaladas: '🥗', salad: '🥗', salads: '🥗',
  panadería: '🥐', panaderia: '🥐', bakery: '🥐', pan: '🥐',
  pizza: '🍕', pizzas: '🍕',
  hamburguesa: '🍔', hamburguesas: '🍔', burger: '🍔', burgers: '🍔',
  taco: '🌮', tacos: '🌮',
  sushi: '🍣',
  helado: '🍦', helados: '🍦', gelato: '🍦',
  jugo: '🧃', jugos: '🧃', juice: '🧃',
  alcohol: '🍺', cerveza: '🍺', beer: '🍺', cocktail: '🍸', coctel: '🍸',
  vino: '🍷', wine: '🍷',
  frappé: '🧋', frappe: '🧋', frappuccino: '🧋', smoothie: '🧋',
  té: '🍵', te: '🍵', tea: '🍵',
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return '🍽️';
}

/* ==================== Payment Form (Stripe Elements) ==================== */

function KioskPaymentForm({ orderId, onSuccess, onError }: {
  orderId: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Error en el pago');
        setProcessing(false);
        return;
      }

      await confirmCustomerPayment(orderId);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error en el pago');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white font-bold py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {processing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Procesando...
          </>
        ) : (
          'Pagar ahora'
        )}
      </button>
    </form>
  );
}

/* ==================== Order Status Tracker ==================== */

const KIOSK_STATUS_STEPS = [
  { key: 'placed', label: 'Orden recibida', icon: Check },
  { key: 'preparing', label: 'Preparando', icon: ChefHat },
  { key: 'ready', label: '¡Lista!', icon: Bell },
] as const;

function getStepIndex(status: string): number {
  if (status === 'ready' || status === 'completed') return 2;
  if (status === 'preparing' || status === 'confirmed') return 1;
  return 0;
}

function KioskOrderTracker({ orderId, onNewOrder }: {
  orderId: number;
  onNewOrder: () => void;
}) {
  const [status, setStatus] = useState<CustomerOrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getCustomerOrderStatus(orderId);
      setStatus(data);
      setError(null);
      if (['ready', 'completed', 'cancelled'].includes(data.status)) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
      if (data.status === 'completed' || data.status === 'cancelled') {
        clearActiveOrder();
      }
    } catch {
      setError('No se pudo verificar el estado');
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus]);

  const stepIndex = status ? getStepIndex(status.status) : 0;
  const isReady = status && (status.status === 'ready' || status.status === 'completed');

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-sm border border-neutral-200">
        {/* Order number */}
        <div className="text-center mb-8">
          <p className="text-neutral-400 text-sm mb-2">Tu orden</p>
          <p className="text-6xl font-black text-brand-600 tracking-tight">
            #{status?.order_number || '...'}
          </p>
        </div>

        {/* Status stepper */}
        <div className="flex items-center justify-between mb-10 px-2">
          {KIOSK_STATUS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i <= stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <React.Fragment key={step.key}>
                {i > 0 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${
                    i <= stepIndex ? 'bg-brand-500' : 'bg-neutral-200'
                  }`} />
                )}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? isCurrent && isReady
                        ? 'bg-green-500 scale-110'
                        : 'bg-brand-600'
                      : 'bg-neutral-100 border-2 border-neutral-200'
                  }`}>
                    <Icon size={22} className={isActive ? 'text-white' : 'text-neutral-400'} />
                  </div>
                  <span className={`text-xs font-semibold ${
                    isActive ? 'text-neutral-900' : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Ready state */}
        {isReady && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-6 animate-pulse">
            <p className="text-green-700 font-bold text-lg">¡Tu orden esta lista!</p>
            <p className="text-green-600 text-sm mt-1">Recogela en el mostrador</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={() => {
            clearActiveOrder();
            onNewOrder();
          }}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-full transition-colors text-lg"
        >
          {isReady ? 'Nueva orden' : 'Nueva orden'}
        </button>
      </div>
    </div>
  );
}

/* ==================== Main Component ==================== */

type KioskView = 'menu' | 'detail' | 'cart' | 'payment' | 'tracking';

export default function KioskScreen() {
  const { branding, palette } = useBranding();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || undefined;

  // Data
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirePayment, setRequirePayment] = useState(false);

  // View + order state
  const [view, setView] = useState<KioskView>('menu');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // UI state
  const [activeTopCategory, setActiveTopCategory] = useState<number>(0);
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroupData[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cart
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Inactivity timer
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      if (cart.length === 0 && view === 'menu') {
        setActiveTopCategory(0);
        setActiveSubCategory(null);
      }
    }, 2 * 60 * 1000);
  }, [cart.length, view, brands]);

  useEffect(() => {
    const events = ['touchstart', 'click', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, [resetInactivityTimer]);

  // Check for existing active order
  useEffect(() => {
    const existingOrderId = loadActiveOrder();
    if (existingOrderId) {
      setOrderId(existingOrderId);
      setView('tracking');
    }
  }, []);

  // Load menu + settings
  useEffect(() => {
    if (view !== 'menu' && view !== 'detail' && view !== 'cart') return;
    if (brands.length > 0) return;

    setError(null);
    Promise.all([
      fetch(`${apiBase()}/customer-order/menu?source=kiosk`).then(r => r.json()),
      getCustomerOrderSettings().catch(() => ({ requirePayment: false })),
    ]).then(([menuData, settings]) => {
      const brandList: BrandData[] = (menuData.brands || menuData || []).map((b: BrandData) => ({
        ...b,
        categories: b.categories.map(c => ({
          ...c,
          items: c.items.map(item => ({ ...item, price: Number(item.price) })),
        })),
      }));
      setBrands(brandList);
      setRequirePayment(settings.requirePayment);

      const firstCat = brandList[0]?.categories?.[0];
      if (firstCat) setActiveSubCategory(firstCat.id);
    }).catch(err => {
      setError('No se pudo cargar el menú');
      console.error(err);
    }).finally(() => setLoading(false));
  }, [view, brands.length]);

  // Deduplicate categories across brands — merge items from same-named categories
  const allCategories = React.useMemo(() => {
    const raw = brands.flatMap(b => b.categories);
    const merged = new Map<string, CategoryData>();
    for (const cat of raw) {
      const key = cat.name.toLowerCase().trim();
      const existing = merged.get(key);
      if (existing) {
        // Merge items, avoiding duplicates by item id
        const existingIds = new Set(existing.items.map(i => i.id));
        for (const item of cat.items) {
          if (!existingIds.has(item.id)) existing.items.push(item);
        }
      } else {
        merged.set(key, { ...cat, items: [...cat.items] });
      }
    }
    return Array.from(merged.values());
  }, [brands]);

  const brandName = branding?.restaurantName || brands[0]?.name || 'Menu';

  // Resolve logo URL — make relative paths absolute for Capacitor
  const logoUrl = React.useMemo(() => {
    const raw = branding?.logoUrl;
    if (!raw) return null;
    if (raw.startsWith('http')) return raw;
    // Relative path like /uploads/... — prepend tenant base on Capacitor
    const tenantSlug = localStorage.getItem('tenant_id');
    const base = tenantSlug
      ? `https://${tenantSlug}.desktop.kitchen`
      : 'https://pos.desktop.kitchen';
    // Always resolve to absolute URL (works on both Capacitor and web)
    return isCapacitor ? `${base}${raw}` : raw;
  }, [branding?.logoUrl]);

  // Build top-level category groups (group categories by icon)
  const topCategoryGroups = React.useMemo(() => {
    const groups: { icon: string; label: string; categoryIds: number[] }[] = [];
    const seen = new Map<string, number>();

    for (const cat of allCategories) {
      const icon = getCategoryIcon(cat.name);
      const existingIdx = seen.get(icon);
      if (existingIdx !== undefined) {
        groups[existingIdx].categoryIds.push(cat.id);
      } else {
        seen.set(icon, groups.length);
        groups.push({
          icon,
          label: cat.name.split(' ')[0],
          categoryIds: [cat.id],
        });
      }
    }

    // If grouping collapsed everything into one, show each category as top-level
    if (groups.length <= 1 && allCategories.length > 1) {
      return allCategories.map(cat => ({
        icon: getCategoryIcon(cat.name),
        label: cat.name.length > 12 ? cat.name.slice(0, 12) + '…' : cat.name,
        categoryIds: [cat.id],
      }));
    }

    return groups;
  }, [allCategories]);

  // Sub-categories for current top-level group
  const visibleSubCategories = React.useMemo(() => {
    if (topCategoryGroups.length === 0) return allCategories;
    const group = topCategoryGroups[activeTopCategory] || topCategoryGroups[0];
    if (!group) return allCategories;
    return allCategories.filter(c => group.categoryIds.includes(c.id));
  }, [topCategoryGroups, activeTopCategory, allCategories]);

  // Items for selected sub-category
  const visibleItems = React.useMemo(() => {
    if (!activeSubCategory) return visibleSubCategories.flatMap(c => c.items);
    const cat = allCategories.find(c => c.id === activeSubCategory);
    return cat ? cat.items : [];
  }, [activeSubCategory, visibleSubCategories, allCategories]);

  // Cart totals
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const modTotal = i.modifiers.reduce((ms, m) => ms + m.price_adjustment, 0);
    return sum + (i.price + modTotal) * i.quantity;
  }, 0);

  // Current item total (for detail view)
  const currentItemTotal = React.useMemo(() => {
    if (!selectedItem) return 0;
    const modSum = Object.values(selectedModifiers)
      .flat()
      .reduce((sum, modId) => {
        for (const g of modifierGroups) {
          const mod = g.modifiers?.find(m => m.id === modId);
          if (mod) return sum + mod.price_adjustment;
        }
        return sum;
      }, 0);
    return (selectedItem.price + modSum) * itemQty;
  }, [selectedItem, selectedModifiers, modifierGroups, itemQty]);

  // Open item detail
  const openItem = useCallback(async (item: MenuItemData) => {
    setSelectedItem(item);
    setItemQty(1);
    setItemNotes('');
    setSelectedModifiers({});
    setModifierGroups([]);
    setLoadingModifiers(true);
    setView('detail');

    try { navigator.vibrate?.(10); } catch { /* ignore */ }

    try {
      const res = await fetch(`${apiBase()}/modifiers/groups/item/${item.id}`);
      if (res.ok) {
        const groups: ModifierGroupData[] = (await res.json()).map((g: ModifierGroupData) => ({
          ...g,
          modifiers: g.modifiers?.map(m => ({ ...m, price_adjustment: Number(m.price_adjustment) })),
        }));
        setModifierGroups(groups);
        const defaults: Record<number, number[]> = {};
        for (const g of groups) {
          if (g.required && g.selection_type === 'single' && g.modifiers?.[0]) {
            defaults[g.id] = [g.modifiers[0].id];
          }
        }
        setSelectedModifiers(defaults);
      }
    } catch {
      // modifiers optional
    } finally {
      setLoadingModifiers(false);
    }
  }, []);

  // Toggle modifier
  const toggleModifier = useCallback((groupId: number, modId: number, selectionType: 'single' | 'multi', maxSelections: number) => {
    setSelectedModifiers(prev => {
      const current = prev[groupId] || [];
      if (selectionType === 'single') {
        return { ...prev, [groupId]: [modId] };
      }
      if (current.includes(modId)) {
        return { ...prev, [groupId]: current.filter(id => id !== modId) };
      }
      if (maxSelections > 0 && current.length >= maxSelections) {
        return prev;
      }
      return { ...prev, [groupId]: [...current, modId] };
    });
  }, []);

  // Add to cart
  const addToCart = useCallback(() => {
    if (!selectedItem) return;

    const allMods: ModifierData[] = [];
    for (const g of modifierGroups) {
      const ids = selectedModifiers[g.id] || [];
      for (const id of ids) {
        const mod = g.modifiers?.find(m => m.id === id);
        if (mod) allMods.push(mod);
      }
    }

    dispatch({
      type: 'ADD_ITEM',
      item: {
        cartId: crypto.randomUUID(),
        menu_item_id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: itemQty,
        notes: itemNotes,
        modifiers: allMods,
      },
    });

    try { navigator.vibrate?.(15); } catch { /* ignore */ }
    setSelectedItem(null);
    setView('menu');
  }, [selectedItem, modifierGroups, selectedModifiers, itemQty, itemNotes]);

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const items: CustomerOrderItem[] = cart.map(ci => ({
        menu_item_id: ci.menu_item_id,
        quantity: ci.quantity,
        notes: ci.notes || undefined,
        modifiers: ci.modifiers.length > 0 ? ci.modifiers.map(m => m.id) : undefined,
      }));

      const result = await placeCustomerOrder(items, tableNumber);
      setOrderId(result.order_id);
      saveActiveOrder(result.order_id);
      dispatch({ type: 'CLEAR' });

      if (requirePayment && stripePromise) {
        try {
          const { clientSecret: secret } = await createCustomerPaymentIntent(result.order_id);
          setClientSecret(secret);
          setView('payment');
        } catch {
          setView('tracking');
        }
      } else {
        setView('tracking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al hacer el pedido');
    } finally {
      setSubmitting(false);
    }
  }, [cart, tableNumber, requirePayment]);

  // Format price (no decimals for MXN)
  const fmt = (n: number) => `$${n.toFixed(0)}`;

  // Modifier columns calculation
  const getModifierGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
  };

  /* ==================== Header ==================== */
  const Header = (
    <header className="bg-white border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-12 w-12 rounded-xl object-cover shadow-sm"
            crossOrigin="anonymous"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : branding?.restaurantName ? (
          <div className="h-12 w-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">{branding.restaurantName.charAt(0)}</span>
          </div>
        ) : null}
        <div>
          <h1 className="text-xl font-bold text-neutral-900 truncate">{brandName}</h1>
          {branding?.tagline && (
            <p className="text-xs text-neutral-400 truncate">{branding.tagline}</p>
          )}
        </div>
      </div>
      {branding?.address && (
        <span className="text-sm text-neutral-400 truncate max-w-[200px]">{branding.address}</span>
      )}
    </header>
  );

  /* ==================== Payment Stage ==================== */
  if (view === 'payment' && clientSecret && orderId && stripePromise) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-sm border border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">Pago</h2>
          <p className="text-neutral-500 text-sm text-center mb-8">
            Completa el pago para confirmar tu orden
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: palette?.['600'] || branding?.primaryColor || '#0d9488',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <KioskPaymentForm
              orderId={orderId}
              onSuccess={() => setView('tracking')}
              onError={(msg) => setError(msg)}
            />
          </Elements>

          <button
            onClick={() => setView('tracking')}
            className="w-full mt-4 text-neutral-400 hover:text-neutral-600 text-sm py-2 transition-colors"
          >
            Omitir — pagar en caja
          </button>
        </div>
      </div>
    );
  }

  /* ==================== Tracking Stage ==================== */
  if (view === 'tracking' && orderId) {
    return (
      <KioskOrderTracker
        orderId={orderId}
        onNewOrder={() => {
          setOrderId(null);
          setClientSecret(null);
          setView('menu');
          setBrands([]);
          setLoading(true);
        }}
      />
    );
  }

  /* ==================== Loading / Error ==================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error && brands.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-brand-600 underline font-medium">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  /* ==================== Detail View (Full Page) ==================== */
  if (view === 'detail' && selectedItem) {
    return (
      <div className="kiosk-root bg-neutral-50 flex flex-col">
        {Header}

        {/* Side-by-side: product left, modifiers right */}
        <div className="flex-1 min-h-0 flex gap-4 px-4 py-3 overflow-hidden">
          {/* Left — product info */}
          <div className="w-56 flex-shrink-0 flex flex-col">
            {selectedItem.imageUrl ? (
              <img
                src={selectedItem.imageUrl}
                alt=""
                className="w-full aspect-square rounded-2xl object-cover"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-neutral-200 flex items-center justify-center">
                <span className="text-5xl text-neutral-400">{selectedItem.name.charAt(0)}</span>
              </div>
            )}
            <h2 className="text-lg font-bold text-neutral-900 mt-3 leading-tight">{selectedItem.name}</h2>
            {selectedItem.description && (
              <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{selectedItem.description}</p>
            )}
            <p className="text-xl font-bold text-brand-600 mt-2">{fmt(selectedItem.price)}</p>
          </div>

          {/* Right — modifier groups flowing into columns */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {loadingModifiers && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              </div>
            )}

            {modifierGroups.length > 0 && (
              <div className="h-full modifier-columns px-1">
                {modifierGroups.map(group => {
                  const icon = getGroupIcon(group.name);
                  return (
                    <div key={group.id} className="break-inside-avoid mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        {icon && <span className="text-base">{icon}</span>}
                        <h3 className="font-bold text-neutral-900 text-sm truncate">{group.name}</h3>
                        {group.required && (
                          <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            Req.
                          </span>
                        )}
                      </div>

                      {group.modifiers?.map(mod => {
                        const isSelected = (selectedModifiers[group.id] || []).includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            onClick={() => toggleModifier(group.id, mod.id, group.selection_type, group.max_selections)}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors active:scale-[0.97]"
                          >
                            <div className={`w-4 h-4 rounded-${group.selection_type === 'single' ? 'full' : 'md'} border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'border-brand-500 bg-brand-500'
                                : 'border-neutral-300'
                            }`}>
                              {isSelected && <Check size={10} className="text-white" />}
                            </div>
                            <span className={`text-xs flex-1 text-left ${isSelected ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>
                              {mod.name}
                            </span>
                            {mod.price_adjustment > 0 && (
                              <span className="text-[10px] text-neutral-400 flex-shrink-0">+{fmt(mod.price_adjustment)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar — part of flex flow, not fixed */}
        <div className="bg-white border-t border-neutral-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => { setSelectedItem(null); setView('menu'); }}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors active:scale-[0.97] flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <input
            type="text"
            value={itemNotes}
            onChange={e => setItemNotes(e.target.value)}
            maxLength={200}
            placeholder="Notas..."
            className="flex-1 min-w-0 bg-neutral-100 rounded-full px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 border-0"
          />

          {/* Quantity stepper */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setItemQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors active:scale-[0.97]"
            >
              <Minus size={14} />
            </button>
            <span className="text-lg font-bold text-neutral-900 w-5 text-center">{itemQty}</span>
            <button
              onClick={() => setItemQty(q => Math.min(99, q + 1))}
              className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors active:scale-[0.97]"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Cart badge */}
          {cartItemCount > 0 && (
            <div className="relative flex-shrink-0">
              <ShoppingBag size={20} className="text-neutral-400" />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
          )}

          <div className="text-right flex-shrink-0 min-w-[50px]">
            <p className="text-[10px] text-neutral-400">Total</p>
            <p className="text-sm font-bold text-neutral-900">{fmt(cartTotal + currentItemTotal)}</p>
          </div>

          <button
            onClick={addToCart}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 active:scale-[0.97] flex-shrink-0"
          >
            agregar
          </button>
        </div>

        <style>{kioskStyles}</style>
      </div>
    );
  }

  /* ==================== Cart View (Full Page) ==================== */
  if (view === 'cart') {
    return (
      <div className="kiosk-root bg-neutral-50 flex flex-col">
        {Header}

        <div className="flex-1 overflow-y-auto pb-32 px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView('menu')}
              className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-2xl font-bold text-neutral-900">Tu pedido</h2>
          </div>

          {cart.length === 0 ? (
            <p className="text-neutral-400 text-center py-16">Tu carrito esta vacio</p>
          ) : (
            <div className="space-y-3">
              {cart.map(ci => {
                const modTotal = ci.modifiers.reduce((s, m) => s + m.price_adjustment, 0);
                const lineTotal = (ci.price + modTotal) * ci.quantity;
                return (
                  <div key={ci.cartId} className="bg-white rounded-2xl p-5 border border-neutral-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-neutral-900 font-semibold">{ci.name}</h3>
                        {ci.modifiers.length > 0 && (
                          <p className="text-neutral-400 text-xs mt-0.5">
                            {ci.modifiers.map(m => m.name).join(', ')}
                          </p>
                        )}
                        {ci.notes && (
                          <p className="text-neutral-400 text-xs mt-0.5 italic">{ci.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', cartId: ci.cartId })}
                        className="text-neutral-300 hover:text-red-400 p-1 ml-2"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QTY', cartId: ci.cartId, quantity: ci.quantity - 1 })}
                          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-neutral-900 font-semibold w-5 text-center">{ci.quantity}</span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QTY', cartId: ci.cartId, quantity: ci.quantity + 1 })}
                          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-neutral-900 font-bold">{fmt(lineTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Fixed bottom bar */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4 flex items-center justify-between z-30">
            <div>
              <p className="text-xs text-neutral-400">Total</p>
              <p className="text-2xl font-bold text-neutral-900">{fmt(cartTotal)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="bg-black hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center gap-2 active:scale-[0.97] text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'finalizar'
              )}
            </button>
          </div>
        )}

        <style>{kioskStyles}</style>
      </div>
    );
  }

  /* ==================== Menu View ==================== */
  return (
    <div className="kiosk-root bg-neutral-50 flex flex-col">
      {Header}

      {/* Top category icon bar */}
      {topCategoryGroups.length > 1 && (
        <div className="bg-white border-b border-neutral-100 overflow-x-auto scrollbar-hide flex-shrink-0">
          <div className="flex gap-1 px-4 py-2">
            {topCategoryGroups.map((group, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTopCategory(idx);
                  const firstCat = allCategories.find(c => group.categoryIds.includes(c.id));
                  if (firstCat) setActiveSubCategory(firstCat.id);
                }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors min-w-[64px] flex-shrink-0 active:scale-[0.97] ${
                  activeTopCategory === idx
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                <span className="text-xl">{group.icon}</span>
                <span className="text-[11px] font-medium whitespace-nowrap">{group.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-category pill tabs */}
      <div className="bg-white border-b border-neutral-100 overflow-x-auto scrollbar-hide flex-shrink-0">
        <div className="flex gap-2 px-4 py-2">
          {visibleSubCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveSubCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 active:scale-[0.97] ${
                activeSubCategory === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex-shrink-0">
          {error}
        </div>
      )}

      {/* Product row — horizontal scroll, fits viewport */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 py-3">
        <div className="flex gap-3 h-full">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => openItem(item)}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-100 text-left hover:shadow-md transition-all active:scale-[0.97] flex flex-col flex-shrink-0 h-full"
              style={{ width: '180px' }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                  <span className="text-3xl text-neutral-300">{item.name.charAt(0)}</span>
                </div>
              )}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-neutral-900 leading-tight line-clamp-2">{item.name}</h3>
                <p className="text-sm font-bold text-brand-600 mt-1">{fmt(item.price)}</p>
              </div>
            </button>
          ))}

          {visibleItems.length === 0 && (
            <p className="text-neutral-400 text-center py-16 w-full">No hay productos disponibles</p>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="bg-white border-t border-neutral-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={26} className="text-neutral-900" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-neutral-400">Total</p>
            <p className="text-lg font-bold text-neutral-900">{fmt(cartTotal)}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (cart.length > 0) setView('cart');
          }}
          disabled={cart.length === 0}
          className={`font-bold px-8 py-3.5 rounded-full transition-colors flex items-center gap-2 active:scale-[0.97] text-base ${
            cart.length > 0
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          finalizar
        </button>
      </div>

      <style>{kioskStyles}</style>
    </div>
  );
}

/* ==================== Shared Styles ==================== */

const kioskStyles = `
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .modifier-columns {
    columns: 2;
    column-gap: 16px;
    column-fill: balance;
  }
  @media (min-width: 900px) {
    .modifier-columns { columns: 3; }
  }
  .kiosk-root {
    height: 100dvh;
    height: 100vh; /* fallback */
    max-height: -webkit-fill-available;
    overflow: hidden;
    touch-action: pan-x;
    overscroll-behavior: none;
  }
  @supports (height: 100dvh) {
    .kiosk-root { height: 100dvh; }
  }
`;
