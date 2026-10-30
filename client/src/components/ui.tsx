import { ReactNode } from 'react'
export const Spinner = () => <div role="status" className="py-16 text-center text-ink/60">Loading…</div>
export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-navy-900/25 bg-white/60 p-10 text-center text-ink/70">{children}</div>
)
export const ErrorBox = ({ message }: { message: string }) => (
  <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{message}</div>
)
export const Wave = ({ className = '', fill = 'rgb(var(--cream))' }: { className?: string; fill?: string }) => (
  <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className={`block h-10 w-full ${className}`} aria-hidden>
    <path d="M0 30 Q150 0 300 30 T600 30 T900 30 T1200 30 V60 H0Z" fill={fill} />
  </svg>
)
export const STATUS_LABEL: Record<string, string> = {
  available: 'Available', coming_soon: 'Coming soon', custom: 'Custom development', private_demo: 'Private demo',
  new: 'New', contacted: 'Contacted', demo_scheduled: 'Demo scheduled', proposal_sent: 'Proposal sent', converted: 'Converted', closed: 'Closed',
  draft: 'Draft', published: 'Published',
}
export const Badge = ({ value }: { value: string }) => (
  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">{STATUS_LABEL[value] ?? value}</span>
)
