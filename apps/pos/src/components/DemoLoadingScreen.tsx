import React, { useState, useEffect } from 'react';

interface DemoLoadingScreenProps {
  onReady: () => void;
  onSkip: () => void;
}

const DemoLoadingScreen: React.FC<DemoLoadingScreenProps> = ({ onReady, onSkip }) => {
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll demo data status every 3s
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/demo-data/status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.hasDemo && data.counts?.orders > 0 && !cancelled) {
          onReady();
        }
      } catch {
        // Polling error — ignore and retry
      }
    };

    const interval = setInterval(poll, 3000);
    // First check after 2s
    const initial = setTimeout(poll, 2000);

    // Auto-ready after 45s regardless
    const timeout = setTimeout(() => {
      if (!cancelled) onReady();
    }, 45000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(initial);
      clearTimeout(timeout);
    };
  }, [onReady]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center">
      <img
        src="/logo.svg"
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
};

export default DemoLoadingScreen;
