import React from 'react';

export const PLAN_COLORS: Record<string, string> = {
  trial: '#6b7280',
  starter: '#3b82f6',
  pro: '#0d9488',
};

export const PIE_COLORS = ['#6b7280', '#3b82f6', '#0d9488'];

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export function KPICard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className="text-teal-500" />
        <span className="text-neutral-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-neutral-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
