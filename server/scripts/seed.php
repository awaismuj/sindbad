<?php
// Usage: php scripts/seed.php   (creates indexes, the first Super Admin, settings and DEMO content)
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';
use App\{Db, Env};
Env::load(__DIR__ . '/../.env');

// ---- Indexes ----
foreach (['products', 'industries', 'services', 'pages', 'plans', 'posts', 'portfolio'] as $c)
    Db::col($c)->createIndex(['slug' => 1], ['unique' => true, 'sparse' => true]);
Db::col('clients')->createIndex(['active' => 1, 'show_on_homepage' => 1, 'order' => 1]);
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
    'description' => 'Sindbad Solution builds business software, POS and ERP systems and automation.',
    'service_intro_message' => 'Service details are being prepared. Contact us to discuss your requirements.',
    'navigation' => [
        ['label' => 'Home', 'path' => '/', 'enabled' => true, 'order' => 0],
        ['label' => 'Products', 'path' => '/products', 'enabled' => true, 'order' => 1],
        ['label' => 'Solutions', 'path' => '/solutions', 'enabled' => true, 'order' => 2],
        ['label' => 'Services', 'path' => '/services', 'enabled' => true, 'order' => 3,
            'children' => [['label' => 'All services', 'path' => '/services', 'enabled' => true]]],
        ['label' => 'Pricing', 'path' => '/pricing', 'enabled' => true, 'order' => 4],
        ['label' => 'Portfolio', 'path' => '/portfolio', 'enabled' => true, 'order' => 5],
        ['label' => 'About Us', 'path' => '/about', 'enabled' => true, 'order' => 6],
        ['label' => 'Blog', 'path' => '/blog', 'enabled' => true, 'order' => 7],
        ['label' => 'Contact Us', 'path' => '/contact', 'enabled' => true, 'order' => 8],
    ],
    'footer_groups' => [
        ['title' => 'Quick Links', 'links' => [
            ['label' => 'About Us', 'path' => '/about', 'enabled' => true],
            ['label' => 'Blog', 'path' => '/blog', 'enabled' => true],
            ['label' => 'Careers', 'path' => '/careers', 'enabled' => true],
            ['label' => 'Life at Sindbad', 'path' => '/life-at-sindbad', 'enabled' => true],
            ['label' => 'Contact Us', 'path' => '/contact', 'enabled' => true],
        ]],
        ['title' => 'Explore', 'links' => [
            ['label' => 'Products', 'path' => '/products', 'enabled' => true],
            ['label' => 'Solutions', 'path' => '/solutions', 'enabled' => true],
            ['label' => 'Services', 'path' => '/services', 'enabled' => true],
            ['label' => 'Pricing', 'path' => '/pricing', 'enabled' => true],
            ['label' => 'About', 'path' => '/about', 'enabled' => true],
            ['label' => 'Contact', 'path' => '/contact', 'enabled' => true],
            ['label' => 'Portfolio', 'path' => '/portfolio', 'enabled' => true],
            ['label' => 'Blog', 'path' => '/blog', 'enabled' => true],
        ]],
    ],
    'client_showcase' => [
        'enabled' => true,
        'heading' => 'Trusted by Businesses That Choose Innovation',
        'description' => 'We partner with businesses across industries to deliver reliable software, technology, and automation solutions.',
        'direction' => 'right_to_left',
        'speed' => 36,
        'logo_height' => 64,
        'spacing' => 48,
        'background' => 'white',
        'grayscale' => true,
        'pause_on_hover' => true,
        'edge_fade' => true,
        'rows' => 1,
        'max_clients' => 20,
    ],
    'currency' => 'USD',
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
$services = ['Custom Software Development', 'POS & ERP Development', 'Business Process Automation', 'Web Application Development', 'Mobile Application Development', 'API Development & Integrations', 'AI-Powered Automation', 'CRM & Business Management Systems', 'Reporting & Analytics', 'Maintenance & Technical Support'];
foreach ($services as $i => $n) {
    $slug = App\Guard::slug($n);
    Db::col('services')->updateOne(['slug' => $slug], ['$setOnInsert' => [
        'name' => $n, 'slug' => $slug, 'description' => 'DEMO CONTENT — describe this service.', 'benefits' => [], 'deliverables' => [],
        'published' => true, 'order' => $i, 'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
$serviceCatalog = [
    ['Cloud Infrastructure Services', 'cloud-infrastructure-services', 'Cloud & Infrastructure'],
    ['Custom Software & Product Development', 'custom-software-product-development', 'Software Development'],
    ['Digital Marketing', 'digital-marketing-services', 'Marketing & Growth'],
    ['CDN Services', 'cdn-services', 'Cloud & Performance'],
    ['AI/ML Solutions', 'ai-ml-solutions', 'AI & Automation'],
    ['Blockchain Development', 'blockchain-development', 'Emerging Technologies'],
    ['EBS ERP Solution', 'ebs-erp-solution', 'Enterprise Software'],
    ['Business Automation Services', 'business-automation', 'Automation'],
    ['POS & Business Management Software', 'pos-business-management', 'Business Management'],
    ['API Development & Integration', 'api-development-integration', 'Software Development'],
];
foreach ($serviceCatalog as $i => [$name, $slug, $category]) {
    Db::col('services')->updateOne(['slug' => $slug], ['$setOnInsert' => [
        'name' => $name, 'slug' => $slug, 'category' => $category, 'short' => '',
        'description' => '', 'benefits' => [], 'deliverables' => [], 'features' => [], 'faqs' => [],
        'status' => 'published', 'published' => true, 'featured' => false,
        'menu_visible' => true, 'footer_visible' => true, 'order' => $i,
        'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
$managedPages = [
    ['About Us', 'about'],
    ['Careers', 'careers'],
    ['Life at Sindbad', 'life-at-sindbad'],
];
foreach ($managedPages as $i => [$title, $slug]) {
    Db::col('pages')->updateOne(['slug' => $slug], ['$setOnInsert' => [
        'name' => $title, 'title' => $title, 'slug' => $slug,
        'short' => '', 'content' => '', 'published' => true, 'order' => $i,
        'created_at' => Db::now(), 'updated_at' => Db::now(),
    ]], ['upsert' => true]);
}
Db::col('products')->updateOne(['slug' => 'genz-pizza'], ['$setOnInsert' => [
    'name' => 'GenZ Pizza Suite', 'slug' => 'genz-pizza', 'category' => 'Restaurant', 'status' => 'private_demo',
    'short' => 'DEMO ENTRY — menu, orders, inventory and cashier for pizza shops.', 'features' => ['Menu management', 'Online orders', 'Cashier', 'Inventory'],
    'benefits' => [], 'faqs' => [], 'pricing_model' => 'Contact us', 'published' => true, 'featured' => true, 'order' => 0,
    'created_at' => Db::now(), 'updated_at' => Db::now(),
]], ['upsert' => true]);
echo "Seed complete.\n";
