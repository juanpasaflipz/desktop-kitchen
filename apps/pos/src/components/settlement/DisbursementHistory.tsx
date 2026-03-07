import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettlementHistory } from '../../api';
import type { DisbursementRecord } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  held: 'bg-red-500/20 text-red-400',
};

export default function DisbursementHistory() {
  const { t } = useTranslation('settlement');
  const [history, setHistory] = useState<DisbursementRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    getSettlementHistory({ limit, offset })
      .then(data => { setHistory(data.history); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  if (loading) {
    return <div className="text-neutral-400 text-center py-8 animate-pulse">Loading...</div>;
  }

  if (history.length === 0) {
    return <div className="text-neutral-500 text-center py-8">{t('history.noHistory')}</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold">{t('history.title')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 text-left border-b border-neutral-700">
              <th className="pb-2">{t('history.date')}</th>
              <th className="pb-2 text-right">{t('history.gross')}</th>
              <th className="pb-2 text-right">{t('history.fees')}</th>
              <th className="pb-2 text-right">{t('history.holdback')}</th>
              <th className="pb-2 text-right">{t('history.net')}</th>
              <th className="pb-2">{t('history.status')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map(row => (
              <tr key={row.id} className="border-b border-neutral-800 text-neutral-300">
                <td className="py-2">{new Date(row.settlement_date).toLocaleDateString()}</td>
                <td className="py-2 text-right">${row.gross_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="py-2 text-right text-neutral-500">
                  ${(row.processor_fee + row.platform_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right text-neutral-500">
                  {row.mca_holdback > 0 ? `$${row.mca_holdback.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                </td>
                <td className="py-2 text-right font-medium text-white">
                  ${row.net_disbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[row.disbursement_status] || ''}`}>
                    {t(`status.${row.disbursement_status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex justify-between items-center pt-2">
          <button
            className="text-sm text-brand-400 disabled:opacity-30"
            disabled={offset === 0}
            onClick={() => setOffset(o => Math.max(0, o - limit))}
          >
            Previous
          </button>
          <span className="text-xs text-neutral-500">{offset + 1}–{Math.min(offset + limit, total)} of {total}</span>
          <button
            className="text-sm text-brand-400 disabled:opacity-30"
            disabled={offset + limit >= total}
            onClick={() => setOffset(o => o + limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
