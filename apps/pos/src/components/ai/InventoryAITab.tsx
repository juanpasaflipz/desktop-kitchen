import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { InventoryForecast } from '../../types';

interface InventoryAITabProps {
  forecasts: InventoryForecast[];
  onRefresh: () => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'critical': return 'text-brand-400 bg-brand-900/30 border-brand-800';
    case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-800';
    case 'medium': return 'text-amber-400 bg-amber-900/30 border-amber-800';
    case 'low': return 'text-green-400 bg-green-900/30 border-green-800';
    default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
  }
};

export default function InventoryAITab({ forecasts, onRefresh }: InventoryAITabProps) {
  const { t } = useTranslation('reports');

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{t('ai.inventoryAi.inventoryForecast')}</h3>
          <button onClick={onRefresh} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400">
            <RefreshCw size={18} />
          </button>
        </div>
        {forecasts.length > 0 ? (
          <div className="space-y-3">
            {forecasts.map((f) => (
              <div key={f.inventory_item_id} className={`p-4 rounded-lg border ${getRiskColor(f.risk_level)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{f.name}</p>
                    <p className="text-sm text-neutral-400">
                      {f.current_quantity} {f.unit} | Avg {f.avg_daily_usage}/{f.unit}/day
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(f.risk_level)}`}>
                      {f.risk_level.toUpperCase()}
                    </span>
                    {f.days_until_stockout !== null && (
                      <p className="text-sm text-neutral-400 mt-1">
                        ~{f.days_until_stockout} {t('ai.inventoryAi.daysLeft')}
                      </p>
                    )}
                  </div>
                </div>
                {f.suggested_reorder_qty && (
                  <p className="text-xs text-neutral-500 mt-2">
                    {t('ai.inventoryAi.suggestedReorder')} {f.suggested_reorder_qty} {f.unit}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">{t('ai.inventoryAi.noDataYet')}</p>
        )}
      </div>
    </div>
  );
}
