<?php
// Usage: php scripts/seed.php   (creates indexes, the first Super Admin, settings and DEMO content)
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';
use App\{Db, Env, Guard};
Env::load(__DIR__ . '/../.env');

// ---- Indexes ----
foreach (['products', 'industries', 'services', 'plans', 'posts', 'portfolio', 'jobs', 'pages', 'service_categories'] as $c)
    Db::col($c)->createIndex(['slug' => 1], ['unique' => true, 'sparse' => true]);
Db::col('applications')->createIndex(['created_at' => -1]); Db::col('nav_items')->createIndex(['group' => 1, 'order' => 1]);
Db::col('users')->createIndex(['email' => 1], ['unique' => true]);
Db::col('leads')->createIndex(['created_at' => -1]); Db::col('leads')->createIndex(['status' => 1]);
Db::col('demos')->createIndex(['created_at' => -1]); Db::col('demos')->createIndex(['status' => 1]);
Db::col('posts')->createIndex(['title' => 'text', 'excerpt' => 'text', 'content' => 'text']);
Db::col('rate_limits')->createIndex(['expires_at' => 1], ['expireAfterSeconds' => 0]);
Db::col('audit_logs')->createIndex(['created_at' => -1]);

// ---- First Super Admin ----
$email = strtolower(Env::get('SEED_ADMIN_EMAIL', ''));
$pw = Env::get('SEED_ADMIN_PASSWORD', '');
if ($email && strlen($pw) >= 12 && !Db::col('users')->findOne(['email' => $email])) {
    Db::col('users')->insertOne(['name' => 'Super Admin', 'email' => $email, 'role' => 'super_admin', 'active' => true,
        'password_hash' => password_hash($pw, PASSWORD_ARGON2ID), 'created_at' => Db::now()]);
    echo "Super Admin created: $email\n";
} else echo "Super Admin skipped (exists, or SEED_ADMIN_* missing / password < 12 chars)\n";

// ---- Settings (no invented contact details) ----
Db::col('settings')->updateOne(['_id' => 'site'], ['$setOnInsert' => [
    'company_name' => 'Sindbad Solution', 'tagline' => 'We sail your business toward new digital horizons',
    'hero_title' => 'Smart software for every business.',
    'hero_text' => 'Manage operations, automate repetitive work and grow with practical software built around the way you run your business.',
    'description' => 'Sindbad Solution builds business software, POS and ERP systems and automation.', 'currency' => 'USD',
    'copyright' => '© Sindbad Solution. All rights reserved.',
    'service_intro' => 'We are preparing the full details of this service. Tell us what you need and our team will respond.',
]], ['upsert' => true]);

// ---- DEMO content (clearly marked; edit or delete in the admin panel) ----
$industries = [
    ['Pizza Shop & Restaurant', 'pizza-restaurant', 'Orders, menu, kitchen and stock in one place', 'utensils', ['Walk-in and online orders are tracked separately', 'Ingredient stock runs out unnoticed'], ['POS and order management', 'Menu and pricing management', 'Ingredient inventory', 'Staff roles', 'Sales reports']],
    ['Pharmacy & Medical Store', 'pharmacy', 'Stock, batches and expiry under control', 'pill', ['Expired stock is found too late', 'Supplier purchases are hard to reconcile'], ['Batch and expiry tracking', 'Supplier management', 'Configurable inventory', 'Sales reports']],
    ['Retail & Supermarket POS', 'retail-pos', 'Fast checkout and accurate stock', 'shopping-cart', ['Manual stock counts', 'Slow checkout'], ['Barcode checkout', 'Stock levels and alerts', 'Daily sales reports']],
    ['Inventory & Warehouse', 'warehouse', 'Know what you hold and where', 'boxes', ['Stock mismatches', 'No movement history'], ['Multi-location stock', 'Transfers', 'Stock movement history']],
    ['Wholesale & Distribution', 'wholesale', 'Orders, credit and delivery tracking', 'truck', ['Credit balances tracked on paper'], ['Customer ledgers', 'Bulk pricing', 'Delivery tracking']],
    ['Salon & Spa', 'salon-spa', 'Appointments and clients', 'scissors', ['Double bookings'], ['Appointment calendar', 'Client history', 'Staff commissions']],
    ['Gym & Fitness', 'gym-fitness', 'Memberships and attendance', 'dumbbell', ['Manual renewals'], ['Membership plans', 'Attendance', 'Renewal reminders']],
    ['School & Academy', 'school-academy', 'Students, fees and results', 'graduation-cap', ['Fee follow-up is manual'], ['Student records', 'Fee management', 'Reports']],
    ['Hotel & Hospitality', 'hotel', 'Bookings and room status', 'bed', ['Overbooking'], ['Reservations', 'Room status', 'Billing']],
    ['Custom Business Systems', 'custom-systems', 'Software shaped around your process', 'settings', ['Off-the-shelf tools do not fit'], ['Process analysis', 'Custom modules', 'Integrations we have verified']],
];
foreach ($industries as $i => [$n, $slug, $head, $icon, $probs, $feats]) {
    Db::col('industries')->updateOne(['slug' => $slug], ['$setOnInsert' => [
        'name' => $n, 'slug' => $slug, 'headline' => $head, 'icon' => $icon, 'problems' => $probs, 'features' => $feats,
        'benefits' => ['Less manual work', 'One source of truth', 'Clear reports'], 'description' => "DEMO CONTENT — replace with your own copy. $head.",
        'faqs' => [], 'published' => true, 'order' => $i, 'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
$services = [
    ['Cloud Infrastructure Services', 'cloud-infrastructure-services', 'Cloud & Infrastructure', 'cloud'],
    ['Custom Software & Product Development', 'custom-software-product-development', 'Software Development', 'code'],
    ['Digital Marketing', 'digital-marketing-services', 'Marketing & Growth', 'megaphone'],
    ['CDN Services', 'cdn-services', 'Cloud & Performance', 'globe'],
    ['AI/ML Solutions', 'ai-ml-solutions', 'AI & Automation', 'brain'],
    ['Blockchain Development', 'blockchain-development', 'Emerging Technologies', 'link'],
    ['EBS ERP Solution', 'ebs-erp-solution', 'Enterprise Software', 'building'],
    ['Business Automation Services', 'business-automation', 'Automation', 'workflow'],
    ['POS & Business Management Software', 'pos-business-management', 'Business Management', 'store'],
    ['API Development & Integration', 'api-development-integration', 'Software Development', 'plug'],
];
// Service categories (managed in Admin > Service categories; services pick from this list)
foreach (array_values(array_unique(array_column($services, 2))) as $i => $cat)
    Db::col('service_categories')->updateOne(['slug' => Guard::slug($cat)], ['$setOnInsert' => ['name' => $cat, 'slug' => Guard::slug($cat), 'published' => true, 'order' => $i,
        'created_at' => Db::now(), 'updated_at' => Db::now()]], ['upsert' => true]);
// Name, slug and category only. Descriptions are written by the administrator; the public page shows a neutral placeholder until then.
foreach ($services as $i => [$n, $slug, $cat, $icon]) {
    Db::col('services')->updateOne(['slug' => $slug], ['$setOnInsert' => [
        'name' => $n, 'slug' => $slug, 'category' => $cat, 'icon' => $icon, 'short' => '', 'status' => 'published',
        'featured' => $i < 4, 'show_in_menu' => true, 'show_in_footer' => true, 'order' => $i, 'sections' => [],
        'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
// Navigation (editable in admin). Dropdown children for Products/Solutions/Services are generated from published records.
$nav = [
    ['header', 'Home', '/', 'none'], ['header', 'Products', '/products', 'products'], ['header', 'Solutions', '/solutions', 'solutions'],
    ['header', 'Services', '/services', 'services'], ['header', 'Pricing', '/pricing', 'none'], ['header', 'Portfolio', '/portfolio', 'none'],
    ['header', 'About Us', '/about', 'none'], ['header', 'Blog', '/blog', 'none'], ['header', 'Contact Us', '/contact', 'none'],
    ['footer_quick', 'About Us', '/about', 'none'], ['footer_quick', 'Blog', '/blog', 'none'], ['footer_quick', 'Careers', '/careers', 'none'],
    ['footer_quick', 'Life at Sindbad Solution', '/life-at-sindbad', 'none'], ['footer_quick', 'Contact Us', '/contact', 'none'],
    ['footer_explore', 'Products', '/products', 'none'], ['footer_explore', 'Solutions', '/solutions', 'none'], ['footer_explore', 'Services', '/services', 'none'],
    ['footer_explore', 'Pricing', '/pricing', 'none'], ['footer_explore', 'About', '/about', 'none'], ['footer_explore', 'Contact', '/contact', 'none'],
    ['footer_explore', 'Portfolio', '/portfolio', 'none'], ['footer_explore', 'Blog', '/blog', 'none'],
];
foreach ($nav as $i => [$g, $label, $url, $auto]) {
    Db::col('nav_items')->updateOne(['group' => $g, 'label' => $label], ['$setOnInsert' => [
        'group' => $g, 'label' => $label, 'url' => $url, 'auto_children' => $auto, 'published' => true, 'desktop' => true, 'mobile' => true,
        'cta' => false, 'order' => $i, 'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
// Empty content pages; the public site shows a neutral placeholder until you write them.
foreach ([['Home', 'home'], ['About Us', 'about'], ['Life at Sindbad Solution', 'life-at-sindbad'], ['Careers', 'careers']] as [$t, $slug])
    Db::col('pages')->updateOne(['slug' => $slug], ['$setOnInsert' => ['title' => $t, 'slug' => $slug, 'published' => true, 'cards' => [], 'values' => [], 'gallery' => [],
        'created_at' => Db::now(), 'updated_at' => Db::now()]], ['upsert' => true]);
Db::col('products')->updateOne(['slug' => 'genz-pizza'], ['$setOnInsert' => [
    'name' => 'GenZ Pizza Suite', 'slug' => 'genz-pizza', 'category' => 'Restaurant', 'status' => 'private_demo',
    'short' => 'DEMO ENTRY — menu, orders, inventory and cashier for pizza shops.', 'features' => ['Menu management', 'Online orders', 'Cashier', 'Inventory'],
    'benefits' => [], 'faqs' => [], 'pricing_model' => 'Contact us', 'published' => true, 'featured' => true, 'order' => 0,
    'created_at' => Db::now(), 'updated_at' => Db::now(),
]], ['upsert' => true]);
echo "Seed complete.\n";
