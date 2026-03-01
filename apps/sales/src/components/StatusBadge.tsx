import type { ProspectStatus, CommissionStatus } from '../types'

const prospectColors: Record<ProspectStatus, string> = {
  visited: 'bg-neutral-700 text-neutral-200',
  interested: 'bg-blue-900/60 text-blue-300',
  demo_scheduled: 'bg-purple-900/60 text-purple-300',
  trial: 'bg-yellow-900/60 text-yellow-300',
  converted: 'bg-green-900/60 text-green-300',
  not_interested: 'bg-red-900/60 text-red-300',
}

const commissionColors: Record<CommissionStatus, string> = {
  pending: 'bg-yellow-900/60 text-yellow-300',
  approved: 'bg-blue-900/60 text-blue-300',
  rejected: 'bg-red-900/60 text-red-300',
  paid: 'bg-green-900/60 text-green-300',
}

const labels: Record<string, string> = {
  visited: 'Visited',
  interested: 'Interested',
  demo_scheduled: 'Demo Scheduled',
  trial: 'Trial',
  converted: 'Converted',
  not_interested: 'Not Interested',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
}

export default function StatusBadge({ status, type = 'prospect' }: { status: string; type?: 'prospect' | 'commission' }) {
  const colors = type === 'prospect' ? prospectColors : commissionColors
  const color = (colors as Record<string, string>)[status] || 'bg-neutral-700 text-neutral-300'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {labels[status] || status}
    </span>
  )
}
