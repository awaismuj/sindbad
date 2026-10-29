import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/public/Home'
import NotFound from './pages/public/NotFound'
import { IndustryDetail, ProductDetail, Products, Services, Solutions } from './pages/public/Catalog'
import { About, Blog, BlogPost, Contact, Demo, Portfolio, Pricing } from './pages/public/Content'
import { AdminLayout, AdminLogin, ContentList, Dashboard, Leads, Settings } from './pages/admin/Admin'

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
        <Route path="content/:key" element={<ContentList />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
