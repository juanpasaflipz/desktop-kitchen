import { useTranslation } from 'react-i18next';
import type { MerchantAdvance } from '../../types';

interface Props {
  advance: MerchantAdvance;
}

const RISK_COLORS: Record<string, string> = {
  healthy: 'text-green-400',
  watch: 'text-yellow-400',
  warning: 'text-orange-400',
  critical: 'text-red-400',
};

export default function AdvanceProgress({ advance }: Props) {
  const { t } = useTranslation('settlement');

  const repaid = advance.total_repaid;
  const total = advance.total_repayment;
  const pct = total > 0 ? Math.min((repaid / total) * 100, 100) : 0;

  return (
    <div className="bg-neutral-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{t('advance.title')}</h3>
        <span className={`text-sm font-medium ${RISK_COLORS[advance.risk_status] || 'text-neutral-400'}`}>
          {t(`risk.${advance.risk_status}`)}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-neutral-400 mb-1">
          <span>{t('advance.progress')}</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-3">
          <div
            className="bg-brand-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-neutral-400">{t('advance.amount')}</span>
          <p className="text-white font-medium">${advance.advance_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <span className="text-neutral-400">{t('advance.totalRepayment')}</span>
          <p className="text-white font-medium">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <span className="text-neutral-400">{t('advance.repaid')}</span>
          <p className="text-green-400 font-medium">${repaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <span className="text-neutral-400">{t('advance.remaining')}</span>
          <p className="text-white font-medium">${advance.remaining_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <span className="text-neutral-400">{t('advance.holdbackPercent')}</span>
          <p className="text-white font-medium">{advance.holdback_percent}%</p>
        </div>
        <div>
          <span className="text-neutral-400">{t('advance.estimatedCompletion')}</span>
          <p className="text-white font-medium">
            {advance.estimated_completion_date
              ? new Date(advance.estimated_completion_date).toLocaleDateString()
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
