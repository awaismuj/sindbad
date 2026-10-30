const modules = [
  { className: 'orders', icon: '↗', label: 'Orders & POS', detail: 'Sales workflows' },
  { className: 'inventory', icon: '◈', label: 'Inventory', detail: 'Stock operations' },
  { className: 'insights', icon: '⌁', label: 'Insights', detail: 'Business visibility' },
  { className: 'automation', icon: '⟳', label: 'Automation', detail: 'Connected processes' },
]

/** Conceptual illustration of connected business tools; it does not display product metrics. */
export function DashboardPreview() {
  return (
    <div className="home-dashboard" aria-label="Illustration of connected business tools">
      <div className="home-dashboard__intro">
        <span className="home-dashboard__eyebrow"><i /> ONE CONNECTED WORKSPACE</span>
        <h2>Bring your business into focus.</h2>
        <p>Purpose-built tools. Working together.</p>
      </div>
      <div className="home-dashboard__system">
        <svg className="home-dashboard__connections" viewBox="0 0 520 320" fill="none" aria-hidden="true">
          <path d="M170 100C205 100 205 145 241 145M350 100C315 100 315 145 279 145M170 235C205 235 205 190 241 190M350 235C315 235 315 190 279 190" />
          <circle cx="170" cy="100" r="3" /><circle cx="350" cy="100" r="3" />
          <circle cx="170" cy="235" r="3" /><circle cx="350" cy="235" r="3" />
        </svg>
        {modules.map((module) => (
          <div key={module.className} className={`home-dashboard__module home-dashboard__module--${module.className}`}>
            <span className="home-dashboard__module-icon" aria-hidden="true">{module.icon}</span>
            <span><b>{module.label}</b><small>{module.detail}</small></span>
            <span className="home-dashboard__module-dot" aria-hidden="true" />
          </div>
        ))}
        <div className="home-dashboard__hub">
          <span className="home-dashboard__hub-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <path d="M20 5v30M5 20h30M9.5 9.5l21 21m0-21-21 21" />
              <circle cx="20" cy="20" r="5.5" />
            </svg>
          </span>
          <b>Your business</b>
          <small>Connected and in sync</small>
        </div>
      </div>
      <div className="home-dashboard__bottom">
        <span><i /> Flexible by design</span>
        <span>Built around the way you work</span>
      </div>
    </div>
  )
}
