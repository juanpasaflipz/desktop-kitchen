import React from 'react';
import { Clock, Plus, Trash2, Eye, X } from 'lucide-react';
import { PricingRule, MenuItem, MenuCategory } from '../../types';
import { formatPrice } from '../../utils/currency';

export default function RulesTab({ rules, menuItems, categories, onEdit, onDelete, onPreview, rulePreview, onClosePreview, onCreate, onToggle }: {
  rules: PricingRule[];
  menuItems: MenuItem[];
  categories: MenuCategory[];
  onEdit: (r: PricingRule) => void;
  onDelete: (id: number) => void;
  onPreview: (id: number) => void;
  rulePreview: any[] | null;
  onClosePreview: () => void;
  onCreate: () => void;
  onToggle: (id: number, active: boolean) => void;
}) {
  const typeColors: Record<string, string> = {
    happy_hour: 'bg-amber-900/40 text-amber-400',
    day_of_week: 'bg-blue-900/40 text-blue-400',
    seasonal: 'bg-green-900/40 text-green-400',
    demand_based: 'bg-purple-900/40 text-purple-400',
    custom: 'bg-neutral-700 text-neutral-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Pricing Rules</h3>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Create Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800 text-center">
          <Clock size={40} className="mx-auto text-neutral-600 mb-4" />
          <p className="text-neutral-400">No pricing rules yet. Create one to automate price adjustments.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">Adjustment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">Priority</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-300">Active</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{r.name}</p>
                    {r.description && <p className="text-neutral-500 text-xs truncate max-w-[200px]">{r.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[r.rule_type] || typeColors.custom}`}>
                      {r.rule_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-300 text-sm">
                    {r.adjustment_value > 0 ? '+' : ''}{r.adjustment_value}{r.adjustment_type === 'percent' ? '%' : ' MXN'}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-sm">{r.priority}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggle(r.id, !r.active)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        r.active ? 'bg-green-600 text-white' : 'bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {r.active ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onPreview(r.id)} className="p-1.5 text-neutral-400 hover:text-brand-400 transition-colors" title="Preview"><Eye size={16} /></button>
                      <button onClick={() => onEdit(r)} className="p-1.5 text-neutral-400 hover:text-white transition-colors" title="Edit">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => onDelete(r.id)} className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rule Preview Modal */}
      {rulePreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClosePreview}>
          <div className="bg-neutral-900 rounded-xl border border-neutral-700 w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Rule Preview</h3>
              <button onClick={onClosePreview} className="text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rulePreview.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <span className="text-white">{p.item_name}</span>
                  <div className="text-sm">
                    <span className="text-neutral-500">{formatPrice(p.current_price)}</span>
                    <span className="mx-2 text-neutral-600">&rarr;</span>
                    <span className={p.change_percent > 0 ? 'text-amber-400' : 'text-green-400'}>
                      {formatPrice(p.projected_price)} ({p.change_percent > 0 ? '+' : ''}{p.change_percent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
