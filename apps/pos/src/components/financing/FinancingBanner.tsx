import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banknote, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';
import { getFinancingOffers } from '../../api';

const FinancingBanner: React.FC = () => {
  const { t } = useTranslation('financing');
  const { currentEmployee } = useAuth();
  const { plan } = usePlan();
  const [dismissed, setDismissed] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number | null>(null);

  const isOwner = currentEmployee?.role === 'admin';

  useEffect(() => {
    if (!isOwner || plan !== 'pro') return;

    getFinancingOffers()
      .then((offers) => {
        const available = offers.find((o) => o.status === 'available' || o.status === 'viewed');
        if (available) setOfferAmount(available.offer_amount);
      })
      .catch(() => {});
  }, [isOwner, plan]);

  if (!isOwner || plan !== 'pro' || dismissed || offerAmount === null) return null;

  const formatted = `$${offerAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-green-900/30 border border-green-800/50 rounded-lg mb-4">
      <Banknote size={18} className="text-green-400 flex-shrink-0" />
      <span className="text-sm text-green-300 flex-1">
        {t('banner.available', { amount: formatted })}
      </span>
      <Link
        to="/admin/financing"
        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors"
      >
        {t('banner.viewOffer')}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="text-green-600 hover:text-green-400 transition-colors"
        aria-label={t('banner.dismiss')}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default FinancingBanner;
