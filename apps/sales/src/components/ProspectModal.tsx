import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProspectStatus } from '../types'

interface Props {
  onClose: () => void
  onSubmit: (data: Record<string, string>) => Promise<void>
}

export default function ProspectModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    neighborhood: '',
    status: 'visited' as ProspectStatus,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.business_name.trim()) {
      setError('Business name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prospect')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-white">Log New Prospect</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p className="text-sm text-red-400 bg-red-900/20 rounded-lg p-2">{error}</p>}

          <Field label="Business Name *" value={form.business_name} onChange={set('business_name')} />
          <Field label="Contact Name" value={form.contact_name} onChange={set('contact_name')} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={form.phone} onChange={set('phone')} type="tel" />
            <Field label="Email" value={form.email} onChange={set('email')} type="email" />
          </div>

          <Field label="Address" value={form.address} onChange={set('address')} />
          <Field label="Neighborhood" value={form.neighborhood} onChange={set('neighborhood')} />

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              <option value="visited">Visited</option>
              <option value="interested">Interested</option>
              <option value="demo_scheduled">Demo Scheduled</option>
              <option value="trial">Trial</option>
              <option value="converted">Converted</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Prospect'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
      />
    </div>
  )
}
