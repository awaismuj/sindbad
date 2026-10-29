/** Renders admin-written rich text. The server sanitises it with an allow-list before it is stored. */
export function Html({ html, className = '' }: { html?: string; className?: string }) {
  if (!html) return null
  return <div className={`prose-sindbad ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
