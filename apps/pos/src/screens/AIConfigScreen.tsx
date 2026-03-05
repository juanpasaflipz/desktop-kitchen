import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, BarChart3, Package, Settings } from 'lucide-react';
import {
  getAIInsights, getAIAnalytics, getAIConfig, updateAIConfig,
  getInventoryForecast, getCategoryRoles, updateCategoryRole,
  exportAIConfig, importAIConfig, runGrokAnalysis,
} from '../api';
import { AIInsights, AIAnalytics, AIConfig, InventoryForecast, CategoryRole } from '../types';
import { usePlan } from '../context/PlanContext';
import UpgradePrompt from '../components/UpgradePrompt';
import DashboardTab from '../components/ai/DashboardTab';
import UpsellTab from '../components/ai/UpsellTab';
import InventoryAITab from '../components/ai/InventoryAITab';
import ConfigTab from '../components/ai/ConfigTab';

type Tab = 'dashboard' | 'upsell' | 'inventory' | 'config';

export default function AIConfigScreen() {
  const { t } = useTranslation('reports');
  const { limits } = usePlan();
  const aiMode = limits.ai.mode;
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [forecasts, setForecasts] = useState<InventoryForecast[]>([]);
  const [categoryRoles, setCategoryRoles] = useState<CategoryRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [grokInsights, setGrokInsights] = useState<any>(null);
  const [analyzingGrok, setAnalyzingGrok] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'dashboard') {
        const [insightsData, analyticsData] = await Promise.all([getAIInsights(), getAIAnalytics()]);
        setInsights(insightsData);
        setAnalytics(analyticsData);
      } else if (activeTab === 'inventory') {
        setForecasts(await getInventoryForecast());
      } else if (activeTab === 'config') {
        const [configData, rolesData] = await Promise.all([getAIConfig(), getCategoryRoles()]);
        setConfig(configData);
        setCategoryRoles(rolesData);
      } else if (activeTab === 'upsell') {
        setAnalytics(await getAIAnalytics());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchData'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (key: string, value: string) => {
    try {
      setSaving(true);
      await updateAIConfig({ key, value });
      setConfig((prev) => prev ? { ...prev, [key]: { ...prev[key], value } } : prev);
    } catch { setError(t('errors.updateConfig')); } finally { setSaving(false); }
  };

  const handleRoleUpdate = async (categoryId: number, role: string) => {
    try {
      await updateCategoryRole(categoryId, role);
      setCategoryRoles((prev) => prev.map((r) => (r.category_id === categoryId ? { ...r, role } : r)));
    } catch { setError(t('errors.updateRole')); }
  };

  const handleRunAnalysis = async () => {
    try {
      setAnalyzingGrok(true);
      setError(null);
      setGrokInsights(await runGrokAnalysis('all'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.runAnalysis'));
    } finally { setAnalyzingGrok(false); }
  };

  const handleExport = async () => {
    try {
      const data = await exportAIConfig();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-config.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError(t('errors.exportConfig')); }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        await importAIConfig(JSON.parse(text));
        fetchData();
      } catch { setError(t('errors.importConfig')); }
    };
    input.click();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('ai.tabs.dashboard'), icon: <Sparkles size={18} /> },
    { id: 'upsell', label: t('ai.tabs.upsell'), icon: <BarChart3 size={18} /> },
    { id: 'inventory', label: t('ai.tabs.inventoryAi'), icon: <Package size={18} /> },
    { id: 'config', label: t('ai.tabs.config'), icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-neutral-900 text-white p-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <Sparkles className="text-brand-500" size={28} />
          <h1 className="text-3xl font-black tracking-tighter">{t('ai.title')}</h1>
        </div>
      </div>

      <div className="bg-neutral-900 border-b border-neutral-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-neutral-950 text-brand-500 border-t-2 border-brand-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {aiMode === 'lite' && (
          <div className="mb-6 space-y-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex items-center gap-3">
              <Sparkles className="text-brand-500 flex-shrink-0" size={20} />
              <span className="text-sm text-neutral-300">AI Lite — 5 free insights/day</span>
              <span className="text-xs text-neutral-500 ml-auto">Upgrade to Pro for unlimited AI insights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">Top Upsell Pair</p>
                <p className="text-lg font-bold text-white mt-2">French Fries + Classic Burger</p>
                <p className="text-brand-500 text-sm mt-1">87% confidence &middot; $45/day potential</p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">Inventory Alert</p>
                <p className="text-lg font-bold text-white mt-2">Order 15% more chicken breast on Fridays</p>
                <p className="text-yellow-500 text-sm mt-1">Based on historical demand patterns</p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                <p className="text-neutral-400 text-sm">Tomorrow's Forecast</p>
                <p className="text-lg font-bold text-white mt-2">Classic Burger, Nachos Supreme</p>
                <p className="text-green-500 text-sm mt-1">Projected high-demand items</p>
              </div>
            </div>
            <UpgradePrompt message="Unlock unlimited AI intelligence, dynamic pricing, and demand forecasting with the Pro plan." />
          </div>
        )}

        {aiMode === 'full' && (<>
          {error && (
            <div className="bg-brand-900/30 border border-brand-800 rounded-lg p-4 mb-6">
              <p className="text-brand-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 animate-pulse">
                  <div className="h-20 bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && insights && (
                <DashboardTab
                  insights={insights}
                  analytics={analytics}
                  grokInsights={grokInsights}
                  analyzingGrok={analyzingGrok}
                  onRunAnalysis={handleRunAnalysis}
                />
              )}
              {activeTab === 'upsell' && analytics && (
                <UpsellTab analytics={analytics} />
              )}
              {activeTab === 'inventory' && (
                <InventoryAITab forecasts={forecasts} onRefresh={fetchData} />
              )}
              {activeTab === 'config' && config && (
                <ConfigTab
                  config={config}
                  categoryRoles={categoryRoles}
                  saving={saving}
                  onConfigUpdate={handleConfigUpdate}
                  onRoleUpdate={handleRoleUpdate}
                  onExport={handleExport}
                  onImport={handleImport}
                />
              )}
            </>
          )}
        </>)}
      </div>
    </div>
  );
}
