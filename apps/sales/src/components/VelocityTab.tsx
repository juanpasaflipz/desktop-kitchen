import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { Download, Zap, Clock, Percent, DollarSign } from 'lucide-react'
import * as api from '../api'
import type { VelocityData } from '../types'

const RANGE_OPTIONS = [
  { label: '3 mo', months: 3 },
  { label: '6 mo', months: 6 },
  { label: '12 mo', months: 12 },
  { label: 'All', months: 0 },
]

export default function VelocityTab() {
  const [data, setData] = useState<VelocityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(6)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api.getVelocity(range || undefined)
      setData(d)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    window.print()
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    )
  }

  // Chart data
  const pipelineChartData = data.monthly_pipeline.map((p, i) => ({
    month: formatMonth(p.month),
    'Prospects': p.count,
    'Converted': data.monthly_conversions[i]?.count || 0,
  }))

  const mrrChartData = data.monthly_mrr_attributed.map(m => ({
    month: formatMonth(m.month),
    MRR: m.mrr,
  }))

  return (
    <div className="space-y-6 velocity-print">
      {/* Controls */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-0.5">
          {RANGE_OPTIONS.map(o => (
            <button
              key={o.months}
              onClick={() => setRange(o.months)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                range === o.months
                  ? 'bg-brand-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<Zap className="w-5 h-5" />}
          label="Sales Velocity"
          value={data.sales_velocity_score}
          format="currency-rate"
          subtitle="MRR generated per day"
          color="brand"
        />
        <KpiCard
          icon={<Clock className="w-5 h-5" />}
          label="Avg Sales Cycle"
          value={data.avg_cycle_days.overall}
          format="days"
          subtitle="first visit to paying customer"
          color="amber"
        />
        <KpiCard
          icon={<Percent className="w-5 h-5" />}
          label="Conversion Rate"
          value={data.conversion_rate_overall.rate}
          format="percent"
          subtitle={`${data.conversion_rate_overall.converted} of ${data.conversion_rate_overall.total} prospects`}
          color="green"
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Sales Team MRR"
          value={data.total_mrr}
          format="currency"
          subtitle="attributed to sales channel"
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart — Pipeline vs Conversions */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-neutral-300 mb-4">Monthly Pipeline vs Conversions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d4d4d4' }}
              />
              <Bar dataKey="Prospects" fill="#525252" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Converted" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart — MRR */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-neutral-300 mb-4">Monthly MRR Attributed</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mrrChartData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#d4d4d4' }}
                formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(0)}`, 'MRR']}
              />
              <Area type="monotone" dataKey="MRR" stroke="#0d9488" strokeWidth={2}
                fill="url(#mrrGrad)" dot={{ r: 3, fill: '#0d9488' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Cohort Conversion Analysis</h3>
        {data.cohort_data.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-8">No cohort data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-700">
                  <th className="pb-2 pr-4 text-left font-medium">Cohort Week</th>
                  <th className="pb-2 px-2 text-center font-medium">Logged</th>
                  <th className="pb-2 px-2 text-center font-medium">7d</th>
                  <th className="pb-2 px-2 text-center font-medium">14d</th>
                  <th className="pb-2 px-2 text-center font-medium">30d</th>
                  <th className="pb-2 px-2 text-center font-medium">60d</th>
                  <th className="pb-2 px-2 text-center font-medium">90d+</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {data.cohort_data.map(c => {
                  const weekAge = Math.floor((Date.now() - new Date(c.cohort_week).getTime()) / (7 * 86400000))
                  return (
                    <tr key={c.cohort_week}>
                      <td className="py-2 pr-4 text-neutral-300 font-medium">
                        {formatWeek(c.cohort_week)}
                      </td>
                      <td className="py-2 px-2 text-center text-neutral-400">{c.logged}</td>
                      <CohortCell value={c.within_7d} total={c.logged} visible={weekAge >= 1} />
                      <CohortCell value={c.within_14d} total={c.logged} visible={weekAge >= 2} />
                      <CohortCell value={c.within_30d} total={c.logged} visible={weekAge >= 4} />
                      <CohortCell value={c.within_60d} total={c.logged} visible={weekAge >= 9} />
                      <CohortCell value={c.within_90d_plus} total={c.logged} visible={weekAge >= 13} />
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rep Performance Table */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Rep Performance</h3>
        {data.rep_leaderboard.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-8">No rep data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-400 border-b border-neutral-700">
                  <th className="pb-2 pr-4 text-left font-medium">Rep</th>
                  <th className="pb-2 px-2 text-center font-medium">Prospects</th>
                  <th className="pb-2 px-2 text-center font-medium">Converted</th>
                  <th className="pb-2 px-2 text-center font-medium">Rate</th>
                  <th className="pb-2 px-2 text-center font-medium">Cycle</th>
                  <th className="pb-2 px-2 text-right font-medium">MRR</th>
                  <th className="pb-2 px-2 text-right font-medium">Commission</th>
                  <th className="pb-2 pl-2 text-center font-medium">Trend (8w)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {data.rep_leaderboard.map(r => (
                  <tr key={r.id} className="text-neutral-200">
                    <td className="py-2.5 pr-4 font-medium">{r.name}</td>
                    <td className="py-2.5 px-2 text-center">{r.prospects_logged}</td>
                    <td className="py-2.5 px-2 text-center">{r.converted}</td>
                    <td className="py-2.5 px-2 text-center text-neutral-400">{r.conversion_rate}%</td>
                    <td className="py-2.5 px-2 text-center text-neutral-400">
                      {r.avg_cycle_days > 0 ? `${r.avg_cycle_days}d` : '--'}
                    </td>
                    <td className="py-2.5 px-2 text-right text-green-400">${r.mrr_attributed.toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right">${r.commission_earned.toFixed(0)}</td>
                    <td className="py-2.5 pl-2">
                      <MiniSparkline data={r.weekly_conversions} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .velocity-print { padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          header, nav, .border-b.border-neutral-800 { display: none !important; }
          .bg-neutral-950 { background: white !important; }
          .bg-neutral-900 { background: #f5f5f5 !important; border-color: #e5e5e5 !important; }
          .text-white, .text-neutral-200, .text-neutral-300 { color: #171717 !important; }
          .text-neutral-400, .text-neutral-500 { color: #525252 !important; }
          .text-green-400 { color: #16a34a !important; }
          .text-brand-400, .text-brand-500 { color: #0d9488 !important; }
        }
      `}</style>
    </div>
  )
}

// ---- Sub-components ----

function KpiCard({ icon, label, value, format, subtitle, color }: {
  icon: React.ReactNode
  label: string
  value: number
  format: 'currency' | 'currency-rate' | 'days' | 'percent'
  subtitle: string
  color: 'brand' | 'green' | 'amber'
}) {
  const animated = useCountUp(value, 1200)
  const colorMap = {
    brand: 'text-brand-500 bg-brand-500/10',
    green: 'text-green-500 bg-green-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
  }

  const formatValue = () => {
    switch (format) {
      case 'currency': return `$${Math.round(animated).toLocaleString()}`
      case 'currency-rate': return `$${animated.toFixed(2)}`
      case 'days': return animated.toFixed(1)
      case 'percent': return `${animated.toFixed(1)}%`
    }
  }

  const unitLabel = format === 'currency-rate' ? '/day' : format === 'days' ? ' days' : format === 'currency' ? '/mo' : ''

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>{icon}</div>
        <span className="text-xs text-neutral-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">
        {formatValue()}<span className="text-sm font-normal text-neutral-500">{unitLabel}</span>
      </p>
      <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
    </div>
  )
}

function CohortCell({ value, total, visible }: { value: number; total: number; visible: boolean }) {
  if (!visible) {
    return <td className="py-2 px-2 text-center text-neutral-700">&mdash;</td>
  }
  const pct = total > 0 ? (value / total) * 100 : 0
  const intensity = Math.min(pct / 50, 1) // 50% = max intensity
  const bg = pct > 0
    ? `rgba(34, 197, 94, ${0.1 + intensity * 0.4})`
    : 'transparent'
  return (
    <td className="py-2 px-2 text-center" style={{ background: bg }}>
      <span className={pct > 0 ? 'text-green-300 font-medium' : 'text-neutral-600'}>
        {pct > 0 ? `${pct.toFixed(0)}%` : '0%'}
      </span>
    </td>
  )
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-px h-5 w-16 mx-auto">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.max((v / max) * 100, 8)}%`,
            background: v > 0 ? '#22c55e' : '#262626',
          }}
        />
      ))}
    </div>
  )
}

// ---- Hooks ----

function useCountUp(target: number, duration: number): number {
  const [current, setCurrent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    startTime.current = null
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts
      const elapsed = ts - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }
    rafId.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId.current)
  }, [target, duration])

  return current
}

// ---- Helpers ----

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} '${y.slice(2)}`
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
