import React from 'react';
import { Lock, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';

interface UpgradePromptProps {
  variant?: 'inline' | 'overlay';
  message?: string;
  feature?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  variant = 'inline',
  message,
  feature,
}) => {
  const navigate = useNavigate();
  const { plan } = usePlan();

  const defaultMessage = feature
    ? `${feature} is available on a paid plan.`
    : 'This feature requires an upgrade.';

  const handleUpgrade = () => {
    navigate('/admin');
  };

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 z-10 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-8 max-w-sm text-center space-y-4">
          <Lock className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">{message || defaultMessage}</h3>
          <p className="text-sm text-neutral-400">
            You're on the <span className="text-brand-400 font-medium capitalize">{plan}</span> plan.
          </p>
          <button
            onClick={handleUpgrade}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg">
      <Lock className="w-5 h-5 text-neutral-500 flex-shrink-0" />
      <span className="text-sm text-neutral-300 flex-1">{message || defaultMessage}</span>
      <button
        onClick={handleUpgrade}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
      >
        <ArrowUpCircle className="w-3.5 h-3.5" />
        Upgrade
      </button>
    </div>
  );
};

export default UpgradePrompt;
