import { CSSProperties, useEffect, useRef, useState } from 'react'
import { useApi } from '../lib/api'

type Client = {
  id: string
  name: string
  logo: string
  website_url?: string | null
  featured?: boolean
}

type ShowcaseConfig = {
  enabled?: boolean
  heading?: string
  description?: string
  direction?: 'right_to_left' | 'left_to_right'
  speed?: number
  logo_height?: number
  spacing?: number
  background?: 'light' | 'white' | 'cream' | 'navy'
  grayscale?: boolean
  pause_on_hover?: boolean
  edge_fade?: boolean
  rows?: number
  max_clients?: number
}

const DEFAULT_CONFIG: Required<ShowcaseConfig> = {
  enabled: true,
  heading: 'Trusted by Businesses That Choose Innovation',
  description: 'We partner with businesses across industries to deliver reliable software, technology, and automation solutions.',
  direction: 'right_to_left',
  speed: 36,
  logo_height: 64,
  spacing: 48,
  background: 'white',
  grayscale: true,
  pause_on_hover: true,
  edge_fade: true,
  rows: 1,
  max_clients: 20,
}

function LogoRow({ clients, config }: { clients: Client[]; config: Required<ShowcaseConfig> }) {
  const viewport = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const [scrolling, setScrolling] = useState(false)
  const [failedIds, setFailedIds] = useState<string[]>([])
  const visibleClients = clients.filter((client) => !failedIds.includes(client.id))

  useEffect(() => {
    const container = viewport.current
    const track = group.current
    if (!container || !track) return
    const measure = () => {
      setScrolling(visibleClients.length > 1 && track.scrollWidth > container.clientWidth * 1.1)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(track)
    measure()
    return () => observer.disconnect()
  }, [visibleClients.length])

  const style = {
    '--client-logo-height': `${config.logo_height}px`,
    '--client-logo-spacing': `${config.spacing}px`,
    '--client-marquee-duration': `${config.speed}s`,
  } as CSSProperties
  const direction = config.direction === 'left_to_right' ? 'left_to_right' : 'right_to_left'

  const renderLogos = (duplicate = false) => visibleClients.map((client) => {
    const image = <img
      src={client.logo}
      alt={duplicate ? '' : client.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailedIds((ids) => ids.includes(client.id) ? ids : [...ids, client.id])}
    />
    const content = client.website_url && /^https?:\/\//i.test(client.website_url)
      ? <a href={client.website_url} target="_blank" rel="noopener noreferrer" tabIndex={duplicate ? -1 : undefined}>{image}</a>
      : image
    return <div key={`${duplicate ? 'copy-' : ''}${client.id}`} className="client-showcase__logo" title={duplicate ? undefined : client.name}>{content}</div>
  })

  if (!visibleClients.length) return null
  return (
    <div
      ref={viewport}
      className={`client-showcase__viewport ${config.edge_fade ? 'client-showcase__viewport--fade' : ''} ${scrolling ? 'client-showcase__viewport--scrolling' : 'client-showcase__viewport--static'}`}
      style={style}
      data-direction={direction}
      data-gray={config.grayscale}
      data-pause={config.pause_on_hover}
    >
      <div className={`client-showcase__track ${scrolling ? 'client-showcase__track--animated' : ''}`} data-direction={direction}>
        <div ref={group} className="client-showcase__group">
          {renderLogos()}
        </div>
        {scrolling && <div className="client-showcase__group client-showcase__group--clone" aria-hidden="true">
          {renderLogos(true)}
        </div>}
      </div>
    </div>
  )
}

export function ClientShowcase() {
  const { data: clientsData } = useApi<{ items: Client[] }>('/api/clients?homepage=1')
  const { data: settingsData } = useApi<{ settings: any }>('/api/settings')
  const config: Required<ShowcaseConfig> = { ...DEFAULT_CONFIG, ...(settingsData?.settings?.client_showcase ?? {}) }
  const clients = (clientsData?.items ?? [])
    .filter((client) => client.logo)
    .slice(0, Math.max(1, Math.min(50, config.max_clients)))
  if (!config.enabled || !clients.length) return null

  const rows = Math.max(1, Math.min(config.rows, clients.length))
  const items = Array.from({ length: rows }, (_, row) => clients.filter((_, index) => index % rows === row))
  const backgrounds = {
    light: 'bg-navy-900 text-white',
    white: 'bg-white text-ink',
    cream: 'bg-cream text-ink',
    navy: 'bg-navy-950 text-white',
  }
  return (
    <section id="clients" className={`client-showcase ${backgrounds[config.background]}`} aria-label="Our clients">
      <div className="container-x py-14 md:py-16">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <h2 className={`text-3xl font-bold md:text-4xl ${config.background === 'light' || config.background === 'navy' ? '!text-white' : ''}`}>{config.heading}</h2>
          {config.description && <p className="mt-3 text-lg opacity-75">{config.description}</p>}
        </div>
        <div className="space-y-5">
          {items.map((row, index) => <LogoRow key={index} clients={row} config={config} />)}
        </div>
      </div>
    </section>
  )
}
