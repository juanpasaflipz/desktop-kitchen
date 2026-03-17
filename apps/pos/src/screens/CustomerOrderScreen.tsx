import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { useBranding } from '../context/BrandingContext';
import { getCustomerOrderSettings, placeCustomerOrder, type CustomerOrderItem } from '../api/customerOrder';
import { ShoppingCart, Plus, Minus, X, ChevronDown, Check, Loader2 } from 'lucide-react';

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

/* ==================== Component ==================== */

export default function CustomerOrderScreen() {
  const { branding } = useBranding();

  // Data
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirePayment, setRequirePayment] = useState(false);

  // UI state
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroupData[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Order confirmation
  const [orderResult, setOrderResult] = useState<{
    order_number: number;
    estimated_ready_minutes: number;
  } | null>(null);

  // Cart
  const [cart, dispatch] = useReducer(cartReducer, []);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Load menu data + settings
  useEffect(() => {
    Promise.all([
      fetch('/api/menu-board/data').then(r => r.json()),
      getCustomerOrderSettings().catch(() => ({ requirePayment: false })),
    ]).then(([menuData, settings]) => {
      const brandList: BrandData[] = menuData.brands || menuData || [];
      setBrands(brandList);
      setRequirePayment(settings.requirePayment);

      // Set first category as active
      const firstCat = brandList[0]?.categories?.[0];
      if (firstCat) setActiveCategory(firstCat.id);
    }).catch(err => {
      setError('Failed to load menu');
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  // All categories flattened
  const allCategories = brands.flatMap(b => b.categories);
  const activeCategoryData = allCategories.find(c => c.id === activeCategory);
  const brandName = branding?.restaurantName || brands[0]?.name || 'Menu';

  // Cart totals
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const modTotal = i.modifiers.reduce((ms, m) => ms + m.price_adjustment, 0);
    return sum + (i.price + modTotal) * i.quantity;
  }, 0);

  // Open item detail
  const openItem = useCallback(async (item: MenuItemData) => {
    setSelectedItem(item);
    setItemQty(1);
    setItemNotes('');
    setSelectedModifiers({});
    setModifierGroups([]);
    setLoadingModifiers(true);

    try {
      const res = await fetch(`/api/modifiers/groups/item/${item.id}`);
      if (res.ok) {
        const groups: ModifierGroupData[] = await res.json();
        setModifierGroups(groups);
        // Pre-select required single-select defaults
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
      // multi
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

    setSelectedItem(null);
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

      const result = await placeCustomerOrder(items);
      setOrderResult(result);
      dispatch({ type: 'CLEAR' });
      setCartOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }, [cart]);

  // Format price
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  /* ==================== Order Confirmation ==================== */
  if (orderResult) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-neutral-900 rounded-2xl p-8 max-w-sm w-full border border-neutral-800">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-neutral-400 mb-6">Your order has been sent to the kitchen</p>

          <div className="bg-neutral-800 rounded-xl p-6 mb-6">
            <p className="text-neutral-500 text-sm mb-1">Your order number</p>
            <p className="text-5xl font-black text-brand-500 tracking-tight">
              #{orderResult.order_number}
            </p>
          </div>

          <p className="text-neutral-400 text-sm mb-8">
            Estimated ready in{' '}
            <span className="text-white font-semibold">
              ~{orderResult.estimated_ready_minutes} min
            </span>
          </p>

          <button
            onClick={() => setOrderResult(null)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Order Again
          </button>
        </div>
      </div>
    );
  }

  /* ==================== Loading / Error ==================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error && brands.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-brand-400 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ==================== Main Menu ==================== */
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {branding?.logoUrl && (
            <img src={branding.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          )}
          <h1 className="text-lg font-bold text-white truncate">{brandName}</h1>
        </div>
        {cartItemCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-brand-600 text-white p-2.5 rounded-xl"
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-brand-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          </button>
        )}
      </header>

      {/* Category pills */}
      <div
        ref={categoryScrollRef}
        className="sticky top-[57px] z-20 bg-neutral-950 border-b border-neutral-800 overflow-x-auto flex gap-2 px-4 py-3 scrollbar-hide"
      >
        {allCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Menu items */}
      <div className="flex-1 p-4 space-y-3 pb-24">
        {activeCategoryData?.items.map(item => (
          <button
            key={item.id}
            onClick={() => openItem(item)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4 text-left hover:border-neutral-700 transition-colors"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{item.name}</h3>
              {item.description && (
                <p className="text-neutral-500 text-sm line-clamp-2 mt-0.5">{item.description}</p>
              )}
              <p className="text-brand-400 font-bold mt-1.5">{fmt(item.price)}</p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Plus size={18} />
              </div>
            </div>
          </button>
        ))}

        {activeCategoryData?.items.length === 0 && (
          <p className="text-neutral-600 text-center py-12">No items in this category</p>
        )}
      </div>

      {/* Floating cart bar */}
      {cartItemCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 max-w-lg mx-auto">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-colors shadow-lg shadow-brand-600/20"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
            </span>
            <span>{fmt(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center">
          <div className="bg-neutral-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white truncate pr-4">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-neutral-500 hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              {selectedItem.description && (
                <p className="text-neutral-400 text-sm">{selectedItem.description}</p>
              )}

              <p className="text-brand-400 text-xl font-bold">{fmt(selectedItem.price)}</p>

              {/* Modifier groups */}
              {loadingModifiers && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                </div>
              )}

              {modifierGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{group.name}</h3>
                    {group.required && (
                      <span className="text-xs bg-brand-600/20 text-brand-400 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {group.modifiers?.map(mod => {
                      const isSelected = (selectedModifiers[group.id] || []).includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => toggleModifier(group.id, mod.id, group.selection_type, group.max_selections)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
                            isSelected
                              ? 'border-brand-500 bg-brand-600/10'
                              : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-${group.selection_type === 'single' ? 'full' : 'md'} border-2 flex items-center justify-center ${
                              isSelected ? 'border-brand-500 bg-brand-600' : 'border-neutral-600'
                            }`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm text-white">{mod.name}</span>
                          </div>
                          {mod.price_adjustment > 0 && (
                            <span className="text-xs text-neutral-400">+{fmt(mod.price_adjustment)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Notes */}
              <div>
                <label className="text-sm text-neutral-500 block mb-1">Special instructions</label>
                <textarea
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Any allergies or preferences..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-neutral-800">
              {/* Quantity selector */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setItemQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:bg-neutral-700"
                >
                  <Minus size={18} />
                </button>
                <span className="text-xl font-bold text-white w-8 text-center">{itemQty}</span>
                <button
                  onClick={() => setItemQty(q => Math.min(99, q + 1))}
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:bg-neutral-700"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add to Cart — {fmt(
                  (selectedItem.price +
                    Object.values(selectedModifiers)
                      .flat()
                      .reduce((sum, modId) => {
                        for (const g of modifierGroups) {
                          const mod = g.modifiers?.find(m => m.id === modId);
                          if (mod) return sum + mod.price_adjustment;
                        }
                        return sum;
                      }, 0)
                  ) * itemQty
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center">
          <div className="bg-neutral-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col">
            {/* Cart header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-neutral-500 hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-neutral-500 text-center py-12">Your cart is empty</p>
              ) : (
                cart.map(ci => {
                  const modTotal = ci.modifiers.reduce((s, m) => s + m.price_adjustment, 0);
                  const lineTotal = (ci.price + modTotal) * ci.quantity;
                  return (
                    <div
                      key={ci.cartId}
                      className="bg-neutral-800 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium">{ci.name}</h3>
                          {ci.modifiers.length > 0 && (
                            <p className="text-neutral-500 text-xs mt-0.5">
                              {ci.modifiers.map(m => m.name).join(', ')}
                            </p>
                          )}
                          {ci.notes && (
                            <p className="text-neutral-600 text-xs mt-0.5 italic">{ci.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', cartId: ci.cartId })}
                          className="text-neutral-600 hover:text-red-400 p-1 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_QTY', cartId: ci.cartId, quantity: ci.quantity - 1 })}
                            className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white hover:bg-neutral-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white font-medium text-sm w-4 text-center">{ci.quantity}</span>
                          <button
                            onClick={() => dispatch({ type: 'UPDATE_QTY', cartId: ci.cartId, quantity: ci.quantity + 1 })}
                            className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white hover:bg-neutral-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-white font-semibold">{fmt(lineTotal)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-neutral-400">Total</span>
                  <span className="text-white font-bold">{fmt(cartTotal)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    requirePayment ? 'Pay & Order' : 'Place Order'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
