import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Brain,
  Truck,
  Package,
  Heart,
  X,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';

const GUIDE_SHOWN_KEY = 'demo_welcome_guide_shown';

interface FeatureCard {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  route: string;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    icon: <BarChart3 size={22} />,
    titleKey: 'demoGuide.reports',
    descKey: 'demoGuide.reportsDesc',
    route: '/admin/reports',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    icon: <Brain size={22} />,
    titleKey: 'demoGuide.ai',
    descKey: 'demoGuide.aiDesc',
    route: '/admin/ai',
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    icon: <Truck size={22} />,
    titleKey: 'demoGuide.delivery',
    descKey: 'demoGuide.deliveryDesc',
    route: '/admin/delivery',
    gradient: 'from-orange-600 to-orange-800',
  },
  {
    icon: <Package size={22} />,
    titleKey: 'demoGuide.inventory',
    descKey: 'demoGuide.inventoryDesc',
    route: '/admin/inventory',
    gradient: 'from-emerald-600 to-emerald-800',
  },
  {
    icon: <Heart size={22} />,
    titleKey: 'demoGuide.loyalty',
    descKey: 'demoGuide.loyaltyDesc',
    route: '/admin/loyalty',
    gradient: 'from-pink-600 to-pink-800',
  },
];

const DemoWelcomeGuide: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { plan } = usePlan();
  const isDemo = sessionStorage.getItem('is_demo') === '1';
  const [visible, setVisible] = useState(
    () => isDemo && plan === 'free' && !sessionStorage.getItem(GUIDE_SHOWN_KEY)
  );

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(GUIDE_SHOWN_KEY, '1');
    setVisible(false);
  };

  const goTo = (route: string) => {
    dismiss();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700/50 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 transition-colors z-10"
          aria-label={t('common.close', 'Close')}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-black tracking-tight text-white mb-1">
            {t('demoGuide.title', 'Welcome to your demo restaurant')}
          </h2>
          <p className="text-sm text-neutral-400">
            {t('demoGuide.subtitle', "We've loaded 30 days of realistic data. Explore what Desktop Kitchen can do:")}
          </p>
        </div>

        {/* Feature cards */}
        <div className="px-6 pb-2 space-y-2">
          {features.map((f) => (
            <button
              key={f.route}
              onClick={() => goTo(f.route)}
              className="w-full flex items-center gap-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/40 hover:border-neutral-600/60 px-4 py-3 text-left transition-all group"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white`}>
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">
                  {t(f.titleKey, f.titleKey.split('.').pop())}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {t(f.descKey, f.descKey.split('.').pop())}
                </div>
              </div>
              <ArrowRight size={16} className="text-neutral-600 group-hover:text-neutral-400 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer — Start taking orders CTA */}
        <div className="px-6 py-4 border-t border-neutral-800">
          <button
            onClick={dismiss}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3 transition-colors"
          >
            <ShoppingCart size={16} />
            {t('demoGuide.startOrders', 'Start taking orders')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoWelcomeGuide;
