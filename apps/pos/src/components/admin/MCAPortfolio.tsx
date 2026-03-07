import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as superAdmin from '../../api/superAdmin';

const RISK_COLORS: Record<string, string> = {
  healthy: 'bg-green-500/20 text-green-400',
  watch: 'bg-yellow-500/20 text-yellow-400',
  warning: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

export default function MCAPortfolio() {
  const { t } = useTranslation('settlement');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [pool, setPool] = useState<any>(null);
  const [capitalAmount, setCapitalAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdmin.getMCAPortfolio().catch(() => ({ active: [], completed: [] })),
      superAdmin.getCapitalPool().catch(() => null),
    ]).then(([p, c]) => { setPortfolio(p); setPool(c); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCapital = async (action: 'add' | 'withdraw') => {
    const amount = parseFloat(capitalAmount);
    if (!amount || amount <= 0) return;
    try {
      await superAdmin.updateCapitalPool(action, amount);
      setCapitalAmount('');
      load();
    } catch {}
  };

  const handlePause = async (id: number) => {
    await superAdmin.pauseAdvance(id, 'Admin review');
    load();
  };

  const handleResume = async (id: number) => {
    await superAdmin.resumeAdvance(id);
    load();
  };

  if (loading) return <div className="text-neutral-400 animate-pulse text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Capital Pool */}
      {pool && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">{t('admin.capitalPool')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <span className="text-neutral-400">{t('admin.totalCapital')}</span>
              <p className="text-white font-medium">${parseFloat(pool.total_capital).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-neutral-400">{t('admin.deployed')}</span>
              <p className="text-yellow-400 font-medium">${parseFloat(pool.deployed).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-neutral-400">{t('admin.available')}</span>
              <p className="text-green-400 font-medium">${parseFloat(pool.available).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-neutral-400">{t('admin.returned')}</span>
              <p className="text-brand-400 font-medium">${parseFloat(pool.total_returned).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={capitalAmount}
              onChange={e => setCapitalAmount(e.target.value)}
              className="bg-neutral-700 text-white rounded px-3 py-1.5 text-sm w-36"
              placeholder="Amount"
            />
            <button onClick={() => handleCapital('add')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded">{t('admin.addCapital')}</button>
            <button onClick={() => handleCapital('withdraw')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded">{t('admin.withdrawCapital')}</button>
          </div>
        </div>
      )}

      {/* Active Advances */}
      <div>
        <h3 className="text-white font-semibold mb-3">{t('admin.activeAdvances')}</h3>
        <div className="space-y-2">
          {portfolio?.active?.map((a: any) => {
            const pct = parseFloat(a.total_repayment) > 0
              ? (parseFloat(a.total_repaid) / parseFloat(a.total_repayment) * 100)
              : 0;
            return (
              <div key={a.id} className="bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white font-medium">{a.tenant_name}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${RISK_COLORS[a.risk_status] || ''}`}>
                      {t(`risk.${a.risk_status}`)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'active' && (
                      <button onClick={() => handlePause(a.id)} className="text-xs text-yellow-400 hover:text-yellow-300">{t('admin.pause')}</button>
                    )}
                    {a.status === 'paused' && (
                      <button onClick={() => handleResume(a.id)} className="text-xs text-green-400 hover:text-green-300">{t('admin.resume')}</button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2 mb-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-neutral-400">
                  <span>Amount: ${parseFloat(a.advance_amount).toLocaleString()}</span>
                  <span>Repaid: ${parseFloat(a.total_repaid).toLocaleString()}</span>
                  <span>Remaining: ${parseFloat(a.remaining_balance).toLocaleString()}</span>
                  <span>Holdback: {a.holdback_percent}%</span>
                </div>
              </div>
            );
          })}
          {(!portfolio?.active || portfolio.active.length === 0) && (
            <p className="text-neutral-500 text-center py-4">No active advances</p>
          )}
        </div>
      </div>
    </div>
  );
}
