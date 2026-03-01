import type { Commission } from '../types'
import StatusBadge from './StatusBadge'

interface Props {
  commissions: Commission[]
  showRep?: boolean
}

export default function CommissionTable({ commissions, showRep }: Props) {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No commissions yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-neutral-400 border-b border-neutral-700">
            <th className="pb-2 pr-4">Business</th>
            {showRep && <th className="pb-2 pr-4">Rep</th>}
            <th className="pb-2 pr-4">Plan</th>
            <th className="pb-2 pr-4 text-right">Amount</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {commissions.map(c => (
            <tr key={c.id} className="text-neutral-200">
              <td className="py-2.5 pr-4">{c.prospect_business_name}</td>
              {showRep && <td className="py-2.5 pr-4 text-neutral-400">{c.sales_rep_name}</td>}
              <td className="py-2.5 pr-4 text-neutral-400">{c.plan_name}</td>
              <td className="py-2.5 pr-4 text-right font-medium">${Number(c.commission_amount_usd).toFixed(2)}</td>
              <td className="py-2.5 pr-4"><StatusBadge status={c.status} type="commission" /></td>
              <td className="py-2.5 text-neutral-500">{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
