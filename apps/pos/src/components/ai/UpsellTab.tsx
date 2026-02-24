import React from 'react';
import { useTranslation } from 'react-i18next';
import { AIAnalytics } from '../../types';

interface UpsellTabProps {
  analytics: AIAnalytics;
}

export default function UpsellTab({ analytics }: UpsellTabProps) {
  const { t } = useTranslation('reports');

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-lg font-bold text-white mb-4">{t('ai.config.suggestionPerformance')}</h3>
        {analytics.byType.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">{t('ai.config.columns.rule')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">{t('ai.config.columns.action')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-300">{t('ai.config.columns.count')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byType.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-800">
                    <td className="px-4 py-3 text-white">{row.suggestion_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.action === 'accepted' ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">{t('ai.upsell.noSuggestionData')}</p>
        )}
      </div>
    </div>
  );
}
