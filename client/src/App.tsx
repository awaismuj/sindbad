import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/public/Home'
import NotFound from './pages/public/NotFound'
import { IndustryDetail, ProductDetail, Products, Solutions } from './pages/public/Catalog'
import ServiceDetail, { Services } from './pages/public/ServiceDetail'
import { About, Careers, Life } from './pages/public/PageView'
import { Blog, BlogPost, Contact, Demo, Portfolio, Pricing } from './pages/public/Content'
import { AdminLayout, AdminLogin, ContentList, Dashboard, Leads, ServicePreview, Settings, Users, Audit } from './pages/admin/Admin'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solutions/:slug" element={<IndustryDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="careers" element={<Careers />} />
        <Route path="life-at-sindbad" element={<Life />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="demo" element={<Demo />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads kind="leads" />} />
        <Route path="demos" element={<Leads kind="demos" />} />
        <Route path="applications" element={<Leads kind="applications" />} />
        <Route path="preview/:id" element={<ServicePreview />} />
        <Route path="content/:key" element={<ContentList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="audit" element={<Audit />} />
      </Route>
    </Routes>
  )
}
