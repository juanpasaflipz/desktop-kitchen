import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw } from 'lucide-react';
import { AIInsights, AIAnalytics } from '../../types';
import { formatPrice } from '../../utils/currency';
import { formatDateTime } from '../../utils/dateFormat';

interface DashboardTabProps {
  insights: AIInsights;
  analytics: AIAnalytics | null;
  grokInsights: any;
  analyzingGrok: boolean;
  onRunAnalysis: () => void;
}

export default function DashboardTab({ insights, analytics, grokInsights, analyzingGrok, onRunAnalysis }: DashboardTabProps) {
  const { t } = useTranslation('reports');

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 text-sm">{t('ai.kpi.suggestionAcceptance')}</p>
          <p className="text-3xl font-bold text-brand-500 mt-2">{insights.suggestions.acceptanceRate}%</p>
          <p className="text-neutral-500 text-xs mt-1">{insights.suggestions.totalEvents} {t('ai.kpi.totalEvents')}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 text-sm">{t('ai.kpi.itemsToPush')}</p>
          <p className="text-3xl font-bold text-green-500 mt-2">{insights.inventory.pushItems}</p>
          <p className="text-neutral-500 text-xs mt-1">{t('ai.kpi.pushDesc')}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 text-sm">{t('ai.kpi.itemsToAvoid')}</p>
          <p className="text-3xl font-bold text-amber-500 mt-2">{insights.inventory.avoidItems}</p>
          <p className="text-neutral-500 text-xs mt-1">{t('ai.kpi.avoidDesc')}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 text-sm">{t('ai.kpi.grokApi')}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {insights.grokStats.enabled ? t('ai.kpi.active') : t('ai.kpi.off')}
          </p>
          <p className="text-neutral-500 text-xs mt-1">
            {insights.grokStats.callsThisHour}/{insights.grokStats.maxCallsPerHour} {t('ai.kpi.callsPerHour')}
          </p>
        </div>
      </div>

      {/* AI Revenue */}
      {analytics && (
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h3 className="text-lg font-bold text-white mb-4">{t('ai.upsell.aiDrivenRevenue')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-800 rounded-lg">
              <p className="text-neutral-400 text-sm">{t('ai.upsell.aiSuggestedSold')}</p>
              <p className="text-2xl font-bold text-white">{analytics.aiRevenue.itemsSold}</p>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <p className="text-neutral-400 text-sm">{t('ai.upsell.revenueFromSuggestions')}</p>
              <p className="text-2xl font-bold text-brand-500">{formatPrice(analytics.aiRevenue.revenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Item Pairs */}
      {insights.topItemPairs.length > 0 && (
        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <h3 className="text-lg font-bold text-white mb-4">{t('ai.upsell.frequentlyTogether')}</h3>
          <div className="space-y-2">
            {insights.topItemPairs.slice(0, 5).map((pair, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <span className="text-white">{pair.item_a_name} + {pair.item_b_name}</span>
                <span className="text-neutral-400 text-sm">{pair.pair_count}x {t('ai.upsell.together')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grok Analysis */}
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{t('ai.upsell.grokAnalysis')}</h3>
          <button
            onClick={onRunAnalysis}
            disabled={analyzingGrok || !insights.grokStats.enabled}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {analyzingGrok ? (
              <><RefreshCw size={16} className="animate-spin" />{t('ai.upsell.analyzing')}</>
            ) : (
              <><Sparkles size={16} />{t('ai.upsell.runAnalysis')}</>
            )}
          </button>
        </div>

        {!insights.grokStats.enabled && (
          <p className="text-neutral-500 text-sm">{t('ai.upsell.enableGrok')}</p>
        )}

        {grokInsights && (
          <div className="space-y-4 mt-4">
            {grokInsights.upsell && (
              <div className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-sm font-semibold text-amber-400 mb-2">{t('ai.upsell.upsellPatterns')}</p>
                {Array.isArray(grokInsights.upsell) ? (
                  <div className="space-y-2">
                    {grokInsights.upsell.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white">{item.item_name}</span>
                        <span className="text-neutral-400 italic">{item.upsell_message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm">{grokInsights.upsell.message || t('ai.upsell.noData')}</p>
                )}
              </div>
            )}

            {grokInsights.inventory && (
              <div className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-400 mb-2">{t('ai.inventoryAi.inventoryTrends')}</p>
                {grokInsights.inventory.insights ? (
                  <ul className="space-y-1">
                    {grokInsights.inventory.insights.map((insight: string, i: number) => (
                      <li key={i} className="text-sm text-neutral-300">- {insight}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-sm">{grokInsights.inventory.message || t('ai.upsell.noData')}</p>
                )}
                {grokInsights.inventory.recommendations && (
                  <div className="mt-2 pt-2 border-t border-neutral-700">
                    <p className="text-xs font-semibold text-neutral-500 mb-1">{t('ai.upsell.recommendations')}</p>
                    {grokInsights.inventory.recommendations.map((rec: string, i: number) => (
                      <p key={i} className="text-sm text-green-400">- {rec}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {grokInsights.forecast && (
              <div className="p-4 bg-neutral-800 rounded-lg">
                <p className="text-sm font-semibold text-purple-400 mb-2">{t('ai.inventoryAi.supplyChainForecast')}</p>
                {grokInsights.forecast.summary ? (
                  <p className="text-sm text-neutral-300">{grokInsights.forecast.summary}</p>
                ) : (
                  <p className="text-neutral-400 text-sm">{grokInsights.forecast.message || t('ai.upsell.noData')}</p>
                )}
                {grokInsights.forecast.urgent_actions && grokInsights.forecast.urgent_actions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-700">
                    <p className="text-xs font-semibold text-brand-400 mb-1">{t('ai.inventoryAi.urgentActions')}</p>
                    {grokInsights.forecast.urgent_actions.map((action: string, i: number) => (
                      <p key={i} className="text-sm text-brand-300">- {action}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-neutral-600">
              {t('ai.upsell.analysisRanAt')} {formatDateTime(new Date(grokInsights.timestamp))}
              {grokInsights.grokStats && ` | ${grokInsights.grokStats.callsThisHour}/${grokInsights.grokStats.maxCallsPerHour} ${t('ai.kpi.callsPerHour')}`}
            </p>
          </div>
        )}
      </div>

      {/* Scheduler Status */}
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
        <h3 className="text-lg font-bold text-white mb-4">{t('ai.config.backgroundJobs')}</h3>
        <div className="space-y-2">
          {insights.aiStatus.scheduler.jobs.map((job, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div>
                <p className="text-white font-medium">{job.name}</p>
                <p className="text-neutral-500 text-xs">
                  {t('ai.config.every')} {Math.round(job.intervalMs / 60000)}{t('ai.config.min')} | {t('ai.config.runs')} {job.runCount}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                job.lastRun ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700 text-neutral-400'
              }`}>
                {job.lastRun ? t('ai.config.active') : t('ai.config.pending')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
