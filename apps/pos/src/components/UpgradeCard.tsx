import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { createCheckoutSession } from '../api';

interface UpgradeCardProps {
  feature: string;
  title: string;
  description: string;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ feature, title, description }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    const token = localStorage.getItem('owner_token');
    if (!token) {
      navigate('/admin/account');
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckoutSession('pro');
      window.location.href = url;
    } catch {
      navigate('/admin/account');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-neutral-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-neutral-400 mt-2">{description}</p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          <ArrowUpCircle className="w-5 h-5" />
          {loading ? 'Redirecting...' : 'Upgrade to Pro — $80/mo'}
        </button>
        <p className="text-xs text-neutral-500">Cancel anytime. No commitment.</p>
      </div>
    </div>
  );
};

export default UpgradeCard;
