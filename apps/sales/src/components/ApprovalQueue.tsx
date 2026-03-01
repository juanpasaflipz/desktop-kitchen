import { useState } from 'react'
import { Check, X, Banknote } from 'lucide-react'
import type { Commission } from '../types'
import StatusBadge from './StatusBadge'

interface Props {
  commissions: Commission[]
  onAction: (id: string, status: string, notes?: string) => Promise<void>
}

export default function ApprovalQueue({ commissions, onAction }: Props) {
  const [actionId, setActionId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async (id: string, status: string) => {
    setLoading(true)
    try {
      await onAction(id, status, notes || undefined)
      setActionId(null)
      setNotes('')
    } finally {
      setLoading(false)
    }
  }

  if (commissions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No commissions to review
      </div>
    )
  }

  // Sort: pending first, then approved, then paid/rejected
  const sorted = [...commissions].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, paid: 2, rejected: 3 }
    return (order[a.status] ?? 4) - (order[b.status] ?? 4)
  })

  return (
    <div className="space-y-3">
      {sorted.map(c => (
        <div key={c.id} className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-sm font-semibold text-white">{c.prospect_business_name}</p>
              <p className="text-xs text-neutral-400">{c.sales_rep_name} &middot; {c.plan_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">${Number(c.commission_amount_usd).toFixed(2)}</span>
              <StatusBadge status={c.status} type="commission" />
            </div>
          </div>

          {c.notes && (
            <p className="text-xs text-neutral-500 mb-2 italic">{c.notes}</p>
          )}

          {actionId === c.id && (
            <div className="mb-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 resize-none"
                rows={2}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {c.status === 'pending' && (
              <>
                {actionId === c.id ? (
                  <>
                    <button
                      onClick={() => handleAction(c.id, 'approved')}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-900/40 text-green-400 hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'rejected')}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => { setActionId(null); setNotes('') }}
                      className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActionId(c.id)}
                    className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Review
                  </button>
                )}
              </>
            )}
            {c.status === 'approved' && (
              <button
                onClick={() => handleAction(c.id, 'paid')}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-900/40 text-brand-400 hover:bg-brand-900/60 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Banknote className="w-3.5 h-3.5" /> Mark as Paid
              </button>
            )}
            <span className="ml-auto text-xs text-neutral-600">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
