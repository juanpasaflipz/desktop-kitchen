import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, DollarSign, ShoppingCart, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import {
  getOverview, getSignups, getChurn, getActivity,
  type OverviewData, type MonthlyData, type ActivityData,
} from '../../api/superAdmin';
import { KPICard, formatCurrency, PLAN_COLORS, PIE_COLORS } from './shared';

function ActivityList({ title, icon: Icon, tenants }: { title: string; icon: any; tenants: any[] }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-teal-500" />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {tenants.map(t => (
          <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
            <div>
              <span className="text-white text-sm">{t.name}</span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${PLAN_COLORS[t.plan]}20`, color: PLAN_COLORS[t.plan] }}>
                {t.plan}
              </span>
            </div>
            <span className="text-neutral-400 text-sm">{t.order_count} orders</span>
          </div>
        ))}
        {tenants.length === 0 && <p className="text-neutral-500 text-sm">No data</p>}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [signups, setSignups] = useState<MonthlyData[]>([]);
  const [churn, setChurn] = useState<MonthlyData[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOverview(), getSignups(), getChurn(), getActivity()])
      .then(([o, s, c, a]) => { setOverview(o); setSignups(s); setChurn(c); setActivity(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview) {
    return <div className="text-neutral-400 text-center py-12">Loading overview...</div>;
  }

  const pieData = [
    { name: 'Trial', value: overview.plan_breakdown.trial },
    { name: 'Starter', value: overview.plan_breakdown.starter },
    { name: 'Pro', value: overview.plan_breakdown.pro },
    { name: 'Ghost Kitchen', value: overview.plan_breakdown.ghost_kitchen },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total Tenants" value={overview.total_tenants} sub={`${overview.active_tenants} active`} />
        <KPICard icon={DollarSign} label="MRR" value={formatCurrency(overview.mrr)} />
        <KPICard icon={ShoppingCart} label="Total Orders" value={overview.total_orders.toLocaleString()} />
        <KPICard icon={Activity} label="Platform Revenue" value={formatCurrency(overview.total_revenue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Monthly Signups</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={signups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <h3 className="text-white font-semibold mb-4">Monthly Churn</h3>
          {churn.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-neutral-500 text-sm">No cancellations recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={churn}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {activity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityList title="Most Active (30d)" icon={TrendingUp} tenants={activity.most_active} />
          <ActivityList title="Least Active (30d)" icon={TrendingDown} tenants={activity.least_active} />
        </div>
      )}
    </div>
  );
}
