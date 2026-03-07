import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMerchantBankAccounts, addMerchantBankAccount, setPrimaryMerchantBankAccount, deleteMerchantBankAccount } from '../../api';
import type { MerchantBankAccount } from '../../types';
import { Building2, Plus, Star, Trash2, ShieldCheck, Clock } from 'lucide-react';

export default function BankAccountManager() {
  const { t } = useTranslation('settlement');
  const [accounts, setAccounts] = useState<MerchantBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clabe, setClabe] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAccounts = () => {
    setLoading(true);
    getMerchantBankAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleAdd = async () => {
    if (!clabe || !beneficiary) { setError(t('bankAccounts.clabe') + ' & ' + t('bankAccounts.beneficiary') + ' required'); return; }
    setSaving(true);
    setError('');
    try {
      await addMerchantBankAccount({ clabe, beneficiary_name: beneficiary, alias: alias || undefined });
      setClabe(''); setBeneficiary(''); setAlias(''); setShowForm(false);
      loadAccounts();
    } catch (e: any) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await setPrimaryMerchantBankAccount(id);
      loadAccounts();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('bankAccounts.deleteConfirm'))) return;
    try {
      await deleteMerchantBankAccount(id);
      loadAccounts();
    } catch {}
  };

  if (loading) return <div className="text-neutral-400 animate-pulse py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{t('bankAccounts.title')}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> {t('bankAccounts.addAccount')}
        </button>
      </div>

      {showForm && (
        <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-xs text-neutral-400">{t('bankAccounts.clabe')}</label>
            <input
              value={clabe}
              onChange={e => setClabe(e.target.value.replace(/\D/g, '').slice(0, 18))}
              className="w-full bg-neutral-700 text-white rounded px-3 py-2 mt-1 text-sm font-mono"
              placeholder="000000000000000000"
              maxLength={18}
            />
            <p className="text-xs text-neutral-500 mt-1">{t('bankAccounts.clabeHelp')}</p>
          </div>
          <div>
            <label className="text-xs text-neutral-400">{t('bankAccounts.beneficiary')}</label>
            <input
              value={beneficiary}
              onChange={e => setBeneficiary(e.target.value)}
              className="w-full bg-neutral-700 text-white rounded px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400">{t('bankAccounts.alias')}</label>
            <input
              value={alias}
              onChange={e => setAlias(e.target.value)}
              className="w-full bg-neutral-700 text-white rounded px-3 py-2 mt-1 text-sm"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : t('bankAccounts.addAccount')}
          </button>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-neutral-500 text-center py-8">
          <Building2 size={32} className="mx-auto mb-2 opacity-50" />
          {t('bankAccounts.noAccounts')}
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-neutral-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-neutral-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{acc.bank_name}</span>
                    {acc.is_primary && <span className="text-xs text-brand-400 flex items-center gap-0.5"><Star size={10} /> {t('bankAccounts.primary')}</span>}
                    {acc.verified
                      ? <span className="text-xs text-green-400 flex items-center gap-0.5"><ShieldCheck size={10} /> {t('bankAccounts.verified')}</span>
                      : <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Clock size={10} /> {t('bankAccounts.unverified')}</span>
                    }
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{acc.clabe}</span>
                  {acc.alias && <span className="text-xs text-neutral-500 ml-2">{acc.alias}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!acc.is_primary && (
                  <button onClick={() => handleSetPrimary(acc.id)} className="text-xs text-neutral-400 hover:text-white">
                    {t('bankAccounts.setPrimary')}
                  </button>
                )}
                <button onClick={() => handleDelete(acc.id)} className="text-neutral-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
