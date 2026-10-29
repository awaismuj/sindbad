// Admin form definitions. Keep in sync with server/src/Content.php.
export type FieldType = 'text' | 'textarea' | 'html' | 'image' | 'url' | 'number' | 'int' | 'bool' | 'list' | 'json' | 'select' | 'sections' | 'repeater' | 'color'
export interface RepKey { k: string; label: string; area?: boolean }
export interface Field { name: string; label: string; type: FieldType; options?: string[]; required?: boolean; help?: string; group?: string; keys?: RepKey[] }
export interface Entity { key: string; title: string; titleField: string; fields: Field[]; badge?: string; previewPath?: string; section: 'Content' | 'Website' }

export const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview (full description)', problems: 'Problems we address', offerings: 'What we offer', features: 'Features and capabilities', benefits: 'Benefits',
  industries: 'Industries served', technologies: 'Technologies and tools', process: 'Delivery process', deliverables: 'Scope and deliverables',
  engagement: 'Engagement models', faqs: 'FAQs', case_studies: 'Case studies', related: 'Related services and products',
}
const seo: Field[] = [
  { name: 'seo_title', label: 'SEO title', type: 'text', group: 'SEO' }, { name: 'seo_description', label: 'SEO description', type: 'textarea', group: 'SEO' },
  { name: 'og_image', label: 'Social sharing image', type: 'image', group: 'SEO' },
]
const pub: Field[] = [{ name: 'published', label: 'Published', type: 'bool', group: 'Visibility' }, { name: 'order', label: 'Display order', type: 'int', group: 'Visibility' }]
const FAQ_KEYS: RepKey[] = [{ k: 'q', label: 'Question' }, { k: 'a', label: 'Answer', area: true }]
const faqs: Field = { name: 'faqs', label: 'Frequently asked questions', type: 'repeater', keys: FAQ_KEYS }

export const entities: Entity[] = [
  { key: 'services', title: 'Services', titleField: 'name', badge: 'status', section: 'Content', previewPath: '/services', fields: [
    { name: 'name', label: 'Service name', type: 'text', required: true, group: 'Basics' }, { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to suggest one from the name', group: 'Basics' },
    { name: 'category', label: 'Category', type: 'text', group: 'Basics' }, { name: 'short', label: 'Short description', type: 'textarea', group: 'Basics' },
    { name: 'icon', label: 'Icon name (optional)', type: 'text', help: 'One of: cloud, code, megaphone, globe, brain, link, building, workflow, store, plug, boxes, compass', group: 'Basics' },
    { name: 'hero_heading', label: 'Hero heading', type: 'text', group: 'Hero' }, { name: 'hero_subheading', label: 'Hero subheading', type: 'textarea', group: 'Hero' },
    { name: 'hero_image', label: 'Hero image', type: 'image', group: 'Hero' },
    { name: 'content', label: 'Full description', type: 'html', group: 'Content' },
    { name: 'problems', label: 'Problems we address', type: 'list', help: 'One per line', group: 'Content' }, { name: 'offerings', label: 'What we offer', type: 'list', group: 'Content' },
    { name: 'features', label: 'Features and capabilities', type: 'list', group: 'Content' }, { name: 'benefits', label: 'Benefits', type: 'list', group: 'Content' },
    { name: 'industries', label: 'Industries served', type: 'list', group: 'Content' }, { name: 'technologies', label: 'Technologies and tools', type: 'list', group: 'Content' },
    { name: 'process', label: 'Delivery process (steps appear in this order)', type: 'repeater', keys: [{ k: 'title', label: 'Step title' }, { k: 'text', label: 'What happens', area: true }], group: 'Content' },
    { name: 'deliverables', label: 'Scope and deliverables', type: 'list', group: 'Content' }, { name: 'engagement', label: 'Engagement or pricing models', type: 'list', group: 'Content' },
    { ...faqs, group: 'Content' },
    { name: 'case_studies', label: 'Case studies (portfolio slugs)', type: 'list', group: 'Related' }, { name: 'related_services', label: 'Related services (slugs)', type: 'list', group: 'Related' },
    { name: 'related_products', label: 'Related products (slugs)', type: 'list', group: 'Related' },
    { name: 'cta_heading', label: 'Call-to-action heading', type: 'text', group: 'Call to action' }, { name: 'cta_text', label: 'Call-to-action text', type: 'textarea', group: 'Call to action' },
    { name: 'sections', label: 'Page sections', type: 'sections', help: 'Tick the sections to show and set their order. Sections with no content are hidden automatically.', group: 'Page layout' },
    ...seo,
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['draft', 'published', 'unpublished'], group: 'Visibility' },
    { name: 'featured', label: 'Featured', type: 'bool', group: 'Visibility' }, { name: 'show_in_menu', label: 'Show in navigation dropdown', type: 'bool', group: 'Visibility' },
    { name: 'show_in_footer', label: 'Show in footer', type: 'bool', group: 'Visibility' }, { name: 'order', label: 'Display order', type: 'int', group: 'Visibility' } ] },
  { key: 'nav_items', title: 'Navigation and footer links', titleField: 'label', section: 'Website', fields: [
    { name: 'label', label: 'Label', type: 'text', required: true }, { name: 'url', label: 'Link, an internal path such as /about or a full https:// address', type: 'text', required: true },
    { name: 'group', label: 'Where it appears', type: 'select', required: true, options: ['header', 'footer_quick', 'footer_explore'] },
    { name: 'parent', label: 'Parent menu item (makes this a dropdown child; leave empty for top level)', type: 'text' },
    { name: 'auto_children', label: 'Auto dropdown from published', type: 'select', options: ['none', 'services', 'products', 'solutions'] },
    { name: 'desktop', label: 'Show on desktop', type: 'bool' }, { name: 'mobile', label: 'Show on mobile', type: 'bool' }, ...pub.map((f) => ({ ...f, group: undefined })) ] },
  { key: 'products', title: 'Products', titleField: 'name', badge: 'status', section: 'Content', previewPath: '/products', fields: [
    { name: 'name', label: 'Name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' }, { name: 'short', label: 'Short description', type: 'textarea' },
    { name: 'description', label: 'Full description', type: 'html' }, { name: 'image', label: 'Image', type: 'image' },
    { name: 'features', label: 'Features', type: 'list' }, { name: 'benefits', label: 'Benefits', type: 'list' },
    { name: 'status', label: 'Availability', type: 'select', required: true, options: ['available', 'coming_soon', 'custom', 'private_demo'] },
    { name: 'pricing_model', label: 'Pricing model', type: 'text' }, { name: 'featured', label: 'Featured', type: 'bool' },
    { name: 'demo', label: 'Working demo available', type: 'bool' }, faqs, ...seo, ...pub ] },
  { key: 'industries', title: 'Solutions', titleField: 'name', section: 'Content', previewPath: '/solutions', fields: [
    { name: 'name', label: 'Name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' },
    { name: 'headline', label: 'Headline', type: 'text' }, { name: 'description', label: 'Description', type: 'html' },
    { name: 'icon', label: 'Icon name', type: 'text' }, { name: 'image', label: 'Image', type: 'image' },
    { name: 'problems', label: 'Business challenges', type: 'list' }, { name: 'features', label: 'Proposed capabilities', type: 'list' }, { name: 'benefits', label: 'Benefits', type: 'list' },
    { name: 'related_services', label: 'Related services (slugs)', type: 'list' }, { name: 'related_products', label: 'Related products (slugs)', type: 'list' },
    faqs, ...seo, ...pub ] },
  { key: 'plans', title: 'Pricing plans', titleField: 'name', section: 'Content', fields: [
    { name: 'name', label: 'Plan name', type: 'text', required: true }, { name: 'product_slug', label: 'Product slug (optional)', type: 'text' },
    { name: 'price', label: 'Price (empty shows "Contact us for pricing")', type: 'number' }, { name: 'currency', label: 'Currency', type: 'text' },
    { name: 'interval', label: 'Billing', type: 'select', options: ['one_time', 'monthly', 'annual', 'custom'] },
    { name: 'setup_fee', label: 'Setup fee', type: 'number' }, { name: 'discount', label: 'Discount', type: 'number' },
    { name: 'features', label: 'Included features', type: 'list' }, { name: 'optional_features', label: 'Optional add-ons', type: 'list' },
    { name: 'contact_sales', label: 'Contact sales only', type: 'bool' }, ...pub ] },
  { key: 'posts', title: 'Blog posts', titleField: 'title', badge: 'status', section: 'Content', previewPath: '/blog', fields: [
    { name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' }, { name: 'author', label: 'Author', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' }, { name: 'content', label: 'Article', type: 'html' },
    { name: 'image', label: 'Featured image', type: 'image' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'tags', label: 'Tags', type: 'list' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['draft', 'published'] }, ...seo ] },
  { key: 'portfolio', title: 'Portfolio', titleField: 'name', section: 'Content', fields: [
    { name: 'name', label: 'Project name', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' }, { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'description', label: 'Description', type: 'html' }, { name: 'challenges', label: 'Challenges', type: 'textarea' }, { name: 'solution', label: 'Solution delivered', type: 'textarea' },
    { name: 'technologies', label: 'Technologies', type: 'list' }, { name: 'deliverables', label: 'Deliverables', type: 'list' }, { name: 'image', label: 'Screenshot', type: 'image' },
    { name: 'outcomes', label: 'Verified outcomes', type: 'textarea' }, { name: 'url', label: 'Project URL', type: 'url' }, ...pub ] },
  { key: 'jobs', title: 'Careers', titleField: 'title', section: 'Content', fields: [
    { name: 'title', label: 'Job title', type: 'text', required: true }, { name: 'slug', label: 'URL slug', type: 'text' }, { name: 'department', label: 'Department', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' }, { name: 'employment_type', label: 'Employment type', type: 'select', options: ['full_time', 'part_time', 'contract', 'internship'] },
    { name: 'description', label: 'Description', type: 'html' }, { name: 'requirements', label: 'Requirements', type: 'list' },
    { name: 'deadline', label: 'Application deadline (YYYY-MM-DD)', type: 'text' }, ...pub ] },
  { key: 'pages', title: 'Pages (Home, About, Life, Careers)', titleField: 'title', section: 'Content', fields: [
    { name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'URL slug (home, about, life-at-sindbad, careers)', type: 'text' },
    { name: 'intro', label: 'Introduction', type: 'textarea' }, { name: 'content', label: 'Main content', type: 'html' }, { name: 'image', label: 'Main image', type: 'image' },
    { name: 'mission', label: 'Mission (About)', type: 'textarea' }, { name: 'vision', label: 'Vision (About)', type: 'textarea' }, { name: 'values', label: 'Values (About)', type: 'list' },
    { name: 'cards', label: 'Content blocks (Home "why us", team, culture)', type: 'repeater', keys: [{ k: 'title', label: 'Title' }, { k: 'text', label: 'Text', area: true }, { k: 'image', label: 'Image address (optional, e.g. /uploads/…)' }] },
    { name: 'gallery', label: 'Gallery image URLs (Life at Sindbad)', type: 'list' }, ...seo, { name: 'published', label: 'Published', type: 'bool' } ] },
  { key: 'faqs', title: 'General FAQs', titleField: 'question', section: 'Content', fields: [
    { name: 'question', label: 'Question', type: 'text', required: true }, { name: 'answer', label: 'Answer', type: 'textarea', required: true },
    { name: 'page', label: 'Page (home, pricing)', type: 'text' }, ...pub ] },
]
