import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <Seo title="Page not found" />
      <h1 className="text-4xl font-bold">This page is not on our chart</h1>
      <p className="mt-3 text-ink/70">The link may be old, or the page may have been unpublished.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  )
}
