import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems, getOrders, getDeliveryPlatforms, getEmployees } from '../api';
import { useBranding } from '../context/BrandingContext';
import { CheckCircle2, Circle, X, Rocket } from 'lucide-react';

interface ChecklistItem {
  key: string;
  label: string;
  route: string;
  done: boolean;
}

const STORAGE_KEY = 'setup_checklist_dismissed';
const CREATED_AT_KEY = 'setup_checklist_created';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SetupChecklistBanner: React.FC = () => {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      setDismissed(true);
      return;
    }

    // Auto-dismiss after 7 days from first seen
    let createdAt = localStorage.getItem(CREATED_AT_KEY);
    if (!createdAt) {
      createdAt = String(Date.now());
      localStorage.setItem(CREATED_AT_KEY, createdAt);
    }
    if (Date.now() - Number(createdAt) > SEVEN_DAYS_MS) {
      setDismissed(true);
      return;
    }

    // Fetch setup status
    let cancelled = false;
    (async () => {
      try {
        const [menuItemsRes, ordersRes, platformsRes, employeesRes] = await Promise.all([
          getMenuItems().catch(() => []),
          getOrders().catch(() => []),
          getDeliveryPlatforms().catch(() => []),
          getEmployees().catch(() => []),
        ]);

        if (cancelled) return;

        // Hide banner if 5+ real orders — tenant is past onboarding
        const realOrders = ordersRes.filter(o => o.status !== 'cancelled');
        if (realOrders.length >= 5) {
          setDismissed(true);
          return;
        }

        // Check each item
        const hasRealMenuItems = menuItemsRes.some(i => !i.is_example);
        const hasDelivery = platformsRes.length > 0;
        const hasBranding = !!branding?.primaryColor && branding.primaryColor !== '#0d9488';
        const hasExtraStaff = employeesRes.length > 1;
        const hasTestOrder = realOrders.length > 0;

        setItems([
          { key: 'menu', label: 'Add a menu item', route: '/admin/menu', done: hasRealMenuItems },
          { key: 'delivery', label: 'Set up delivery platforms', route: '/admin/delivery', done: hasDelivery },
          { key: 'branding', label: 'Customize branding', route: '/admin/branding', done: hasBranding },
          { key: 'staff', label: 'Add a staff member', route: '/admin/employees', done: hasExtraStaff },
          { key: 'order', label: 'Take a test order', route: '', done: hasTestOrder },
        ]);
      } catch {
        // Don't show banner on error
        setDismissed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [branding]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  if (dismissed || !items) return null;

  const doneCount = items.filter(i => i.done).length;

  // Hide when all items checked
  if (doneCount === items.length) return null;

  return (
    <div className="mx-4 mt-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 animate-in slide-in-from-top">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <Rocket size={16} className="text-brand-400 flex-shrink-0" />
        <span className="text-white text-sm font-semibold flex-1">
          Get started — {doneCount}/{items.length} complete
        </span>
        <button
          onClick={handleDismiss}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 touch-manipulation"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-800 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => item.route && !item.done && navigate(item.route)}
            disabled={item.done || !item.route}
            className={`flex items-center gap-1.5 text-xs transition-colors touch-manipulation ${
              item.done
                ? 'text-neutral-500 line-through cursor-default'
                : 'text-neutral-300 hover:text-brand-400 cursor-pointer'
            }`}
          >
            {item.done
              ? <CheckCircle2 size={13} className="text-brand-500 flex-shrink-0" />
              : <Circle size={13} className="text-neutral-600 flex-shrink-0" />
            }
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SetupChecklistBanner;
