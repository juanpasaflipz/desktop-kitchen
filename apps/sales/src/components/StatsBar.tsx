import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
}

export default function StatsBar({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-500">{s.icon}</span>
            <span className="text-xs text-neutral-400">{s.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{s.value}</p>
        </div>
      ))}
    </div>
  )
}

export function repStatsCards(stats: { total_prospects: number; conversion_count: number; pending_commissions_total: number; paid_commissions_total: number }) {
  return [
    { label: 'Prospects', value: stats.total_prospects, icon: <Users className="w-4 h-4" /> },
    { label: 'Converted', value: stats.conversion_count, icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Pending $', value: `$${Number(stats.pending_commissions_total).toFixed(0)}`, icon: <Clock className="w-4 h-4" /> },
    { label: 'Paid $', value: `$${Number(stats.paid_commissions_total).toFixed(0)}`, icon: <DollarSign className="w-4 h-4" /> },
  ]
}
