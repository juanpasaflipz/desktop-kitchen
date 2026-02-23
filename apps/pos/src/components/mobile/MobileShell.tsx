import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, ChefHat, ScanBarcode, User } from 'lucide-react';

interface Tab {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const tabs: Tab[] = [
  { path: '/m/orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { path: '/m/kitchen', label: 'Kitchen', icon: <ChefHat className="w-5 h-5" /> },
  { path: '/m/scan', label: 'Scan', icon: <ScanBarcode className="w-5 h-5" />, roles: ['manager', 'admin'] },
  { path: '/m/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentEmployee } = useAuth();

  const visibleTabs = tabs.filter((tab) => {
    if (!tab.roles) return true;
    return currentEmployee && tab.roles.includes(currentEmployee.role);
  });

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <div className="flex-1 pb-20 overflow-y-auto">
        {children}
      </div>

      {/* Bottom Tab Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-around items-center h-16">
          {visibleTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation ${
                  isActive ? 'text-brand-500' : 'text-neutral-500'
                }`}
              >
                {tab.icon}
                <span className="text-xs font-semibold mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileShell;
