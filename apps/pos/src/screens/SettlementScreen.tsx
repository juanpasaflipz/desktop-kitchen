import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MerchantSettlementView from '../components/settlement/MerchantSettlementView';
import BankAccountManager from '../components/settlement/BankAccountManager';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettlementScreen() {
  const { t } = useTranslation('settlement');
  const navigate = useNavigate();
  const [tab, setTab] = useState<'money' | 'bank'>('money');

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-neutral-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-neutral-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('money')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'money' ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('tabs.myMoney')}
          </button>
          <button
            onClick={() => setTab('bank')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'bank' ? 'bg-brand-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('tabs.bankAccounts')}
          </button>
        </div>

        {/* Content */}
        {tab === 'money' ? <MerchantSettlementView /> : <BankAccountManager />}
      </div>
    </div>
  );
}
