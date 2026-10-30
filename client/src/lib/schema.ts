// Admin form definitions. Keep in sync with server/src/Content.php.
export type FieldType = 'text' | 'textarea' | 'url' | 'image' | 'number' | 'int' | 'bool' | 'list' | 'json' | 'select'
export interface Field { name: string; label: string; type: FieldType; options?: string[]; required?: boolean; help?: string }
export interface Entity { key: string; title: string; titleField: string; fields: Field[]; badge?: string }

const seo: Field[] = [
  { name: 'seo_title', label: 'SEO title', type: 'text' },
  { name: 'seo_description', label: 'SEO description', type: 'textarea' },
]
const pub: Field[] = [
  { name: 'published', label: 'Published', type: 'bool' },
  { name: 'order', label: 'Display order', type: 'int' },
]

export const entities: Entity[] = [
  { key: 'products', title: 'Products', titleField: 'name', badge: 'status', fields: [
    { name: 'name', label: 'Name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to generate from the name' },
    { name: 'category', label: 'Category', type: 'text' }, { name: 'short', label: 'Short description', type: 'textarea' },
    { name: 'description', label: 'Full description', type: 'textarea' }, { name: 'image', label: 'Image', type: 'image' },
    { name: 'features', label: 'Features', type: 'list', help: 'One per line' }, { name: 'benefits', label: 'Benefits', type: 'list', help: 'One per line' },
    { name: 'status', label: 'Availability', type: 'select', required: true, options: ['available', 'coming_soon', 'custom', 'private_demo'] },
    { name: 'pricing_model', label: 'Pricing model', type: 'text' }, { name: 'featured', label: 'Featured', type: 'bool' },
    { name: 'demo', label: 'Working demo available (shows a trial button)', type: 'bool' },
    { name: 'faqs', label: 'FAQs (JSON: [{"q":"","a":""}])', type: 'json' }, ...seo, ...pub ] },
  { key: 'industries', title: 'Industries', titleField: 'name', fields: [
    { name: 'name', label: 'Name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'headline', label: 'Headline', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'icon', label: 'Icon name', type: 'text' }, { name: 'image', label: 'Image', type: 'image' },
    { name: 'problems', label: 'Common problems', type: 'list' }, { name: 'features', label: 'Features', type: 'list' },
    { name: 'benefits', label: 'Benefits', type: 'list' }, { name: 'faqs', label: 'FAQs (JSON: [{"q":"","a":""}])', type: 'json' }, ...seo, ...pub ] },
  { key: 'services', title: 'Services', titleField: 'name', badge: 'status', fields: [
    { name: 'name', label: 'Service name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to generate from the service name' },
    { name: 'category', label: 'Service category', type: 'text' }, { name: 'short', label: 'Short description', type: 'textarea' },
    { name: 'hero_heading', label: 'Hero heading', type: 'text' }, { name: 'hero_subheading', label: 'Hero subheading', type: 'textarea' },
    { name: 'hero_image', label: 'Hero image', type: 'image' }, { name: 'image', label: 'Directory image', type: 'image' },
    { name: 'description', label: 'Full description', type: 'textarea', help: 'Plain text; line breaks are preserved. Do not enter HTML or scripts.' },
    { name: 'problems', label: 'Problems addressed', type: 'list' }, { name: 'offers', label: 'What we offer', type: 'list' },
    { name: 'features', label: 'Features and capabilities', type: 'list' }, { name: 'benefits', label: 'Benefits', type: 'list' },
    { name: 'industries', label: 'Industries served', type: 'list' }, { name: 'technologies', label: 'Technologies and tools', type: 'list' },
    { name: 'process', label: 'Delivery process', type: 'list' }, { name: 'deliverables', label: 'Project scope and deliverables', type: 'list' },
    { name: 'engagement_models', label: 'Pricing or engagement models', type: 'list' },
    { name: 'faqs', label: 'FAQs (JSON: [{"q":"","a":""}])', type: 'json' },
    { name: 'case_studies', label: 'Portfolio case-study slugs', type: 'list' },
    { name: 'related_services', label: 'Related service slugs', type: 'list' },
    { name: 'related_products', label: 'Related product slugs', type: 'list' },
    { name: 'cta_heading', label: 'Call-to-action heading', type: 'text' }, { name: 'cta_description', label: 'Call-to-action description', type: 'textarea' },
    { name: 'seo_title', label: 'SEO title', type: 'text' }, { name: 'seo_description', label: 'SEO meta description', type: 'textarea' },
    { name: 'og_image', label: 'Open Graph image', type: 'image' },
    { name: 'status', label: 'Publication status', type: 'select', required: true, options: ['draft', 'published', 'unpublished'] },
    { name: 'featured', label: 'Featured service', type: 'bool' },
    { name: 'menu_visible', label: 'Show in Services navigation menu', type: 'bool' },
    { name: 'footer_visible', label: 'Show in footer service links', type: 'bool' },
    { name: 'order', label: 'Display order', type: 'int' } ] },
  { key: 'pages', title: 'Pages', titleField: 'name', fields: [
    { name: 'name', label: 'Internal name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'title', label: 'Page title', type: 'text' }, { name: 'short', label: 'Introduction', type: 'textarea' },
    { name: 'content', label: 'Page content', type: 'textarea' }, { name: 'image', label: 'Page image', type: 'image' },
    { name: 'published', label: 'Published', type: 'bool' }, { name: 'order', label: 'Display order', type: 'int' }, ...seo ] },
  { key: 'clients', title: 'Clients', titleField: 'name', fields: [
    { name: 'name', label: 'Client / company name', type: 'text', required: true },
    { name: 'logo', label: 'Client logo', type: 'image', required: true },
    { name: 'website_url', label: 'Website URL (optional)', type: 'url' },
    { name: 'description', label: 'Short description (optional)', type: 'textarea' },
    { name: 'industry', label: 'Industry (optional)', type: 'text' },
    { name: 'order', label: 'Display order', type: 'int' },
    { name: 'featured', label: 'Featured client', type: 'bool' },
    { name: 'active', label: 'Active', type: 'bool' },
    { name: 'show_on_homepage', label: 'Show on homepage', type: 'bool' },
  ] },
  { key: 'plans', title: 'Pricing plans', titleField: 'name', fields: [
    { name: 'name', label: 'Plan name', type: 'text', required: true }, { name: 'product_slug', label: 'Product slug (optional)', type: 'text' },
    { name: 'price', label: 'Price (leave empty for "Contact us for pricing")', type: 'number' }, { name: 'currency', label: 'Currency', type: 'text' },
    { name: 'interval', label: 'Billing', type: 'select', options: ['one_time', 'monthly', 'annual', 'custom'] },
    { name: 'setup_fee', label: 'Setup fee', type: 'number' }, { name: 'discount', label: 'Discount', type: 'number' },
    { name: 'features', label: 'Included features', type: 'list' }, { name: 'optional_features', label: 'Optional add-ons', type: 'list' },
    { name: 'contact_sales', label: 'Contact sales only', type: 'bool' }, ...pub ] },
  { key: 'posts', title: 'Blog posts', titleField: 'title', badge: 'status', fields: [
    { name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' }, { name: 'content', label: 'Content (plain text; blank line = new paragraph)', type: 'textarea' },
    { name: 'image', label: 'Featured image', type: 'image' }, { name: 'category', label: 'Category', type: 'text' },
    { name: 'tags', label: 'Tags', type: 'list' }, { name: 'status', label: 'Status', type: 'select', required: true, options: ['draft', 'published'] }, ...seo ] },
  { key: 'portfolio', title: 'Portfolio', titleField: 'name', fields: [
    { name: 'name', label: 'Project name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'industry', label: 'Industry', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'challenges', label: 'Challenges', type: 'textarea' }, { name: 'solution', label: 'Solution delivered', type: 'textarea' },
    { name: 'technologies', label: 'Technologies', type: 'list' }, { name: 'image', label: 'Screenshot', type: 'image' },
    { name: 'outcomes', label: 'Verified outcomes', type: 'textarea' }, { name: 'url', label: 'Project URL', type: 'url' }, ...pub ] },
  { key: 'faqs', title: 'FAQs', titleField: 'question', fields: [
    { name: 'question', label: 'Question', type: 'text', required: true }, { name: 'answer', label: 'Answer', type: 'textarea', required: true },
    { name: 'page', label: 'Page (e.g. home, pricing)', type: 'text' }, ...pub ] },
]
