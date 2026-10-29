import { ReactNode } from 'react'
export const Spinner = () => <div role="status" className="py-16 text-center text-ink/60">Loading…</div>
export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-navy-900/25 bg-white/60 p-10 text-center text-ink/70">{children}</div>
)
export const ErrorBox = ({ message }: { message: string }) => (
  <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{message}</div>
)
/** Rolling sea line between sections */
export const Wave = ({ className = '', fill = 'rgb(var(--paper))' }: { className?: string; fill?: string }) => (
  <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className={`block h-10 w-full ${className}`} aria-hidden>
    <path d="M0 30 Q150 0 300 30 T600 30 T900 30 T1200 30 V60 H0Z" fill={fill} />
  </svg>
)
export const STATUS_LABEL: Record<string, string> = {
  available: 'Available', coming_soon: 'Coming soon', custom: 'Custom development', private_demo: 'Private demo',
  new: 'New', contacted: 'Contacted', demo_scheduled: 'Demo scheduled', proposal_sent: 'Proposal sent', converted: 'Converted', closed: 'Closed',
  draft: 'Draft', published: 'Published', unpublished: 'Unpublished', featured: 'Featured',
  super_admin: 'Super admin', content_manager: 'Content manager', sales_manager: 'Sales manager',
}
const TONE: Record<string, string> = { available: 'bg-teal-50 text-teal-700', coming_soon: 'bg-amber/25 text-navy-900', custom: 'bg-navy-900/10 text-navy-800', featured: 'bg-amber/25 text-navy-900', draft: 'bg-navy-900/10 text-navy-800', unpublished: 'bg-red-100 text-red-800' }
export const Badge = ({ value }: { value: string }) => (
  <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[value] ?? 'bg-teal-50 text-teal-700'}`}>{STATUS_LABEL[value] ?? value}</span>
)
