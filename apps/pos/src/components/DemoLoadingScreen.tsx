import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, BarChart3, Brain, Truck, ArrowRight } from 'lucide-react';

interface DemoLoadingScreenProps {
  onReady: () => void;
  onSkip: () => void;
}

type Phase = 'loading' | 'welcome';

const DemoLoadingScreen: React.FC<DemoLoadingScreenProps> = ({ onReady, onSkip }) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Poll demo data status every 3s
  useEffect(() => {
    if (phase !== 'loading') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/demo-data/status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.hasDemo && data.counts?.orders > 0 && !cancelled) {
          setPhase('welcome');
        }
      } catch {
        // Polling error — ignore and retry
      }
    };

    const interval = setInterval(poll, 3000);
    const initial = setTimeout(poll, 2000);

    // Auto-advance after 45s regardless
    const timeout = setTimeout(() => {
      if (!cancelled) setPhase('welcome');
    }, 45000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(initial);
      clearTimeout(timeout);
    };
  }, [phase]);

  const navigateTo = useCallback((hash: string) => {
    // Mark welcome guide as shown so DemoWelcomeGuide doesn't double-modal
    sessionStorage.setItem('demo_welcome_guide_shown', '1');
    // Navigate to the target and reload so AuthContext picks up
    window.location.href = window.location.origin + window.location.pathname + hash;
    window.location.reload();
  }, []);

  // ── Phase: Loading ──────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center">
        <img
          src="/logo.png"
          alt="Desktop Kitchen"
          className="w-16 h-16 mb-8 animate-pulse"
        />

        <h2 className="text-2xl font-black tracking-tight text-white mb-3">
          Preparing your demo restaurant{dots}
        </h2>

        <p className="text-neutral-400 text-sm mb-8 max-w-sm text-center">
          Loading 500+ sample orders, customers, delivery data, AI analytics, and financial reports.
        </p>

        {/* Progress bar */}
        <div className="w-64 bg-neutral-800 rounded-full h-1.5 mb-6">
          <div
            className="h-1.5 rounded-full bg-teal-600 transition-all duration-1000"
            style={{ width: `${Math.min(elapsed * 2.5, 95)}%` }}
          />
        </div>

        {elapsed > 8 && (
          <button
            onClick={onSkip}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Skip — explore while data loads
          </button>
        )}
      </div>
    );
  }

  // ── Phase: Welcome ──────────────────────────────────────────
  const features = [
    {
      icon: ShoppingCart,
      title: 'Take Orders',
      desc: 'Full POS with modifiers, combos, and split payments',
      hash: '#/pos',
      primary: true,
    },
    {
      icon: BarChart3,
      title: 'View Reports',
      desc: '30 days of sales data, trends, and financials',
      hash: '#/admin/reports',
      primary: false,
    },
    {
      icon: Brain,
      title: 'AI Intelligence',
      desc: 'Smart upsell suggestions and inventory insights',
      hash: '#/admin/ai',
      primary: false,
    },
    {
      icon: Truck,
      title: 'Delivery Analytics',
      desc: 'Per-platform margins and markup optimization',
      hash: '#/admin/delivery',
      primary: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center px-4">
      <img
        src="/logo.png"
        alt="Desktop Kitchen"
        className="w-14 h-14 mb-6"
      />

      <h2 className="text-2xl font-black tracking-tight text-white mb-2 text-center">
        Your demo restaurant is ready
      </h2>
      <p className="text-neutral-400 text-sm mb-8 max-w-md text-center">
        We loaded a full taqueria with 30 days of orders, delivery data, and analytics. Explore the features that matter most to you.
      </p>

      <div className="w-full max-w-md space-y-3 mb-8">
        {features.map((f) => (
          <button
            key={f.hash}
            onClick={() => navigateTo(f.hash)}
            className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 text-left transition-all ${
              f.primary
                ? 'bg-teal-900/50 border border-teal-700/60 hover:bg-teal-800/50'
                : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              f.primary ? 'bg-teal-600' : 'bg-neutral-800'
            }`}>
              <f.icon size={20} className={f.primary ? 'text-white' : 'text-neutral-300'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${f.primary ? 'text-teal-100' : 'text-white'}`}>
                {f.title}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">{f.desc}</div>
            </div>
            <ArrowRight size={16} className="text-neutral-500 flex-shrink-0" />
          </button>
        ))}
      </div>

      <button
        onClick={() => navigateTo('#/pos')}
        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        Or just start exploring freely
      </button>
    </div>
  );
};

export default DemoLoadingScreen;
