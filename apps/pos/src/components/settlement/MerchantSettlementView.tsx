import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettlementSummary, getActiveAdvance } from '../../api';
import type { SettlementSummary, MerchantAdvance } from '../../types';
import AdvanceProgress from './AdvanceProgress';
import DisbursementHistory from './DisbursementHistory';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react';

export default function MerchantSettlementView() {
  const { t } = useTranslation('settlement');
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [advance, setAdvance] = useState<MerchantAdvance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSettlementSummary().catch(() => null),
      getActiveAdvance().catch(() => null),
    ]).then(([s, a]) => {
      setSummary(s);
      setAdvance(a);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-neutral-400 text-center py-12 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
              <Wallet size={16} /> {t('summary.pending')}
            </div>
            <p className="text-2xl font-bold text-white">
              ${summary.pending_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-500">{summary.pending_count} {t('status.pending').toLowerCase()}</p>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
              <ArrowDownCircle size={16} /> {t('summary.nextDisbursement')}
            </div>
            {summary.next_disbursement ? (
              <>
                <p className="text-2xl font-bold text-green-400">
                  ${summary.next_disbursement.net_disbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(summary.next_disbursement.settlement_date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-neutral-500 text-sm">{t('summary.noPending')}</p>
            )}
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
              <Calendar size={16} /> {t('summary.monthFees')}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">{t('summary.platformFee')}</span>
                <span className="text-white">${summary.month_fees.platform.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{t('summary.processorFee')}</span>
                <span className="text-white">${summary.month_fees.processor.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {summary.month_fees.holdback > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t('summary.holdback')}</span>
                  <span className="text-yellow-400">${summary.month_fees.holdback.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active advance */}
      {advance && <AdvanceProgress advance={advance} />}

      {/* Disbursement history */}
      <DisbursementHistory />
    </div>
  );
}
