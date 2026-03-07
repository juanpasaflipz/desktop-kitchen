import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as superAdmin from '../../api/superAdmin';

const TYPE_COLORS: Record<string, string> = {
  settlement_received: 'text-green-400',
  merchant_disbursement: 'text-red-400',
  mca_disbursement: 'text-orange-400',
  capital_injection: 'text-blue-400',
  capital_withdrawal: 'text-purple-400',
};

export default function HoldingAccountLedger() {
  const { t } = useTranslation('settlement');
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    superAdmin.getHoldingLedger({ limit, offset })
      .then(data => { setEntries(data.entries || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  if (loading) return <div className="text-neutral-400 animate-pulse text-center py-8">Loading...</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold">{t('admin.ledger')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 text-left border-b border-neutral-700">
              <th className="pb-2">Date</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Merchant</th>
              <th className="pb-2 text-right">Credit</th>
              <th className="pb-2 text-right">Debit</th>
              <th className="pb-2 text-right">Balance</th>
              <th className="pb-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-b border-neutral-800 text-neutral-300">
                <td className="py-2 text-xs">{new Date(e.created_at).toLocaleString()}</td>
                <td className={`py-2 text-xs ${TYPE_COLORS[e.entry_type] || 'text-neutral-400'}`}>{e.entry_type}</td>
                <td className="py-2 text-xs">{e.tenant_name || '—'}</td>
                <td className="py-2 text-right text-green-400">{parseFloat(e.credit) > 0 ? `$${parseFloat(e.credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}</td>
                <td className="py-2 text-right text-red-400">{parseFloat(e.debit) > 0 ? `$${parseFloat(e.debit).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}</td>
                <td className="py-2 text-right font-medium text-white">${parseFloat(e.balance_after).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="py-2 text-xs text-neutral-500 max-w-48 truncate">{e.description}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-neutral-500">No ledger entries</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex justify-between items-center pt-2">
          <button className="text-sm text-brand-400 disabled:opacity-30" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))}>Previous</button>
          <span className="text-xs text-neutral-500">{offset + 1}–{Math.min(offset + limit, total)} of {total}</span>
          <button className="text-sm text-brand-400 disabled:opacity-30" disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)}>Next</button>
        </div>
      )}
    </div>
  );
}
