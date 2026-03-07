import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as superAdmin from '../../api/superAdmin';
import { Wallet, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function SettlementDashboard() {
  const { t } = useTranslation('settlement');
  const [overview, setOverview] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      superAdmin.getSettlementOverview().catch(() => null),
      superAdmin.getSettlementBatches({ limit: 10 }).catch(() => ({ batches: [] })),
      superAdmin.getDisbursementQueue({ status: 'pending', limit: 20 }).catch(() => ({ disbursements: [] })),
    ]).then(([ov, b, d]) => {
      setOverview(ov);
      setBatches(b?.batches || []);
      setDisbursements(d?.disbursements || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (lineId: number) => {
    try {
      await superAdmin.approveDisbursement(lineId);
      setDisbursements(prev => prev.filter(d => d.id !== lineId));
    } catch {}
  };

  const handleHold = async (lineId: number) => {
    try {
      await superAdmin.holdDisbursement(lineId, 'Admin review');
      setDisbursements(prev => prev.filter(d => d.id !== lineId));
    } catch {}
  };

  if (loading) return <div className="text-neutral-400 animate-pulse text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><Wallet size={14} /> {t('admin.holdingBalance')}</div>
            <p className="text-xl font-bold text-white">${overview.holding_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><Clock size={14} /> {t('admin.pendingDisbursements')}</div>
            <p className="text-xl font-bold text-yellow-400">${overview.pending_disbursement?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-neutral-500">{overview.pending_count} pending</p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><DollarSign size={14} /> {t('admin.platformFees')}</div>
            <p className="text-xl font-bold text-green-400">${overview.month_platform_fees?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><TrendingUp size={14} /> {t('admin.totalOutstanding')}</div>
            <p className="text-xl font-bold text-white">${overview.mca?.total_outstanding?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Batches */}
      <div>
        <h3 className="text-white font-semibold mb-3">{t('admin.batches')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-neutral-400 text-left border-b border-neutral-700">
                <th className="pb-2">Reference</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Gross</th>
                <th className="pb-2 text-right">Fees</th>
                <th className="pb-2 text-right">Net</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b: any) => (
                <tr key={b.id} className="border-b border-neutral-800 text-neutral-300">
                  <td className="py-2 font-mono text-xs">{b.batch_reference}</td>
                  <td className="py-2">{new Date(b.settlement_date).toLocaleDateString()}</td>
                  <td className="py-2 text-right">${parseFloat(b.total_gross).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 text-right text-neutral-500">${parseFloat(b.total_fees).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 text-right font-medium text-white">${parseFloat(b.total_net).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">{b.status}</span></td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-neutral-500">No batches yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursement Queue */}
      <div>
        <h3 className="text-white font-semibold mb-3">{t('admin.disbursementQueue')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-neutral-400 text-left border-b border-neutral-700">
                <th className="pb-2">Merchant</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Net</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.map((d: any) => (
                <tr key={d.id} className="border-b border-neutral-800 text-neutral-300">
                  <td className="py-2">{d.tenant_name}</td>
                  <td className="py-2">{new Date(d.settlement_date).toLocaleDateString()}</td>
                  <td className="py-2 text-right font-medium text-white">${parseFloat(d.net_disbursement).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => handleApprove(d.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">{t('admin.approve')}</button>
                    <button onClick={() => handleHold(d.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">{t('admin.hold')}</button>
                  </td>
                </tr>
              ))}
              {disbursements.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-neutral-500">No pending disbursements</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
