<?php
declare(strict_types=1);

use App\{Auth, Content, Db, Guard, Http, Mailer, PageMeta, Refs, Router};

/** Validates a menu URL: external must be https/http; internal must be a known route or an existing published item. Returns an error string or null. */
function self_check_url(string $url): ?string {
    if (preg_match('#^https?://[^\s]+$#i', $url)) return null;
    if (!str_starts_with($url, '/') || str_contains($url, ' ')) return 'Use a full https:// address or an internal path like /about';
    $static = ['/', '/products', '/solutions', '/services', '/pricing', '/portfolio', '/about', '/blog', '/contact', '/demo', '/careers', '/life-at-sindbad'];
    if (in_array($url, $static, true) || str_starts_with($url, '/blog')) return null;
    if (preg_match('#^/(services|products|solutions)/([a-z0-9\-]+)$#', $url, $m)) {
        $col = ['services' => 'services', 'products' => 'products', 'solutions' => 'industries'][$m[1]];
        return Db::col($col)->findOne(['slug' => $m[2]]) ? null : 'That page does not exist yet. Create it first, then link to it';
    }
    return 'Unknown internal page';
}

return function (Router $r): void {
    $content = Content::all();
    $CONTENT_ROLES = ['content_manager'];
    $SALES_ROLES = ['sales_manager'];

    $r->add('GET', '/api/health', fn() => Http::json(['ok' => true]));

    // ---------- Auth ----------
    $r->add('POST', '/api/auth/login', function () {
        Guard::rateLimit('login', 8, 900);
        $b = Http::body();
        $u = Auth::login((string)($b['email'] ?? ''), (string)($b['password'] ?? ''));
        if (!$u) Http::error('Incorrect email or password', 401);
        Guard::audit($u, 'login', 'users', $u['id']);
        Http::json(['user' => ['id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role']]]);
    });
    $r->add('POST', '/api/auth/logout', function () { Auth::logout(); Http::json(['ok' => true]); });
    $r->add('GET', '/api/auth/me', function () {
        $u = Auth::user();
        Http::json(['user' => $u ? ['id' => $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'role' => $u['role']] : null]);
    });

    // ---------- Public settings ----------
    $r->add('GET', '/api/settings', function () {
        $s = Db::col('settings')->findOne(['_id' => 'site']);
        Http::json(['settings' => $s ? Db::ser($s) : (object)[]]);
    });

    // ---------- Public content + admin CRUD (generated per collection) ----------
    foreach ($content as $name => $cfg) {
        $r->add('GET', "/api/$name", function () use ($name, $cfg) {
            $q = trim((string)($_GET['q'] ?? ''));
            $filter = $cfg['public'];
            if ($q !== '') $filter['$or'] = array_map(fn($f) => [$f => new \MongoDB\BSON\Regex(preg_quote(mb_substr($q, 0, 60)), 'i')], array_keys(array_filter($cfg['fields'], fn($f) => in_array($f['type'], ['string', 'text'], true))));
            foreach (['category', 'tag'] as $k) if (!empty($_GET[$k])) $filter[$k === 'tag' ? 'tags' : 'category'] = (string)$_GET[$k];
            $cur = Db::col($name)->find($filter, ['sort' => $cfg['sort'], 'limit' => 100, 'projection' => ['content' => 0]]);
            Http::json(['items' => Db::ser(iterator_to_array($cur, false))]);
        });
        $r->add('GET', "/api/$name/{slug}", function ($p) use ($name, $cfg) {
            $doc = Db::col($name)->findOne($cfg['public'] + ['slug' => $p['slug']]);
            if (!$doc) Http::error('Not found', 404);
            Http::json(['item' => Db::ser($doc)]);
        });

        $r->add('GET', "/api/admin/$name", function () use ($name, $cfg, $CONTENT_ROLES) {
            Auth::require($CONTENT_ROLES);
            $cur = Db::col($name)->find([], ['sort' => ['order' => 1, 'updated_at' => -1], 'limit' => 300, 'projection' => ['content' => 0]]);
            Http::json(['items' => Db::ser(iterator_to_array($cur, false))]);
        });
        $r->add('GET', "/api/admin/$name/{id}", function ($p) use ($name, $CONTENT_ROLES) {
            Auth::require($CONTENT_ROLES);
            $doc = ($oid = Db::oid($p['id'])) ? Db::col($name)->findOne(['_id' => $oid]) : null;
            if (!$doc) Http::error('Not found', 404);
            Http::json(['item' => Db::ser($doc)]);
        });
        $save = function (?string $id) use ($name, $cfg, $CONTENT_ROLES) {
            $u = Auth::require($CONTENT_ROLES);
            [$data, $err] = Guard::clean(Http::body(), $cfg['fields'], $id !== null);
            if ($err) Http::error('Please fix the highlighted fields', 422, $err);
            $col = Db::col($name);
            if ($name === 'nav_items' && isset($data['url']) && ($e = self_check_url($data['url']))) Http::error('Please fix the highlighted fields', 422, ['url' => $e]);
            if (empty($data['slug']) && isset($cfg['fields']['slug'])) {
                if ($id === null) $data['slug'] = Guard::slug((string)($data[$cfg['slugFrom']] ?? ''));
            } elseif (isset($data['slug'])) $data['slug'] = Guard::slug($data['slug']);
            if (!empty($data['slug'])) {
                $dup = $col->findOne(['slug' => $data['slug']] + ($id ? ['_id' => ['$ne' => Db::oid($id)]] : []));
                if ($dup) Http::error('That URL slug is already used', 422, ['slug' => 'Already in use']);
            }
            $data['updated_at'] = Db::now();
            if ($name === 'posts' && ($data['status'] ?? '') === 'published') $data['published_at'] = Db::now();
            if (isset($cfg['fields']['slug']) === false) unset($data['slug']);
            if ($id === null) {
                $data['created_at'] = Db::now();
                if (array_key_exists('published', $cfg['fields']) && !isset($data['published'])) $data['published'] = false;
                $res = $col->insertOne($data);
                $newId = (string)$res->getInsertedId();
                Guard::audit($u, 'create', $name, $newId);
                Http::json(['id' => $newId], 201);
            }
            $oid = Db::oid($id) ?? Http::error('Not found', 404);
            $old = Refs::tracked($name) ? $col->findOne(['_id' => $oid], ['projection' => ['slug' => 1, 'name' => 1]]) : null;
            $col->updateOne(['_id' => $oid], ['$set' => $data]);
            if ($old) {
                if (isset($data['slug']) && ($old['slug'] ?? '') !== $data['slug']) Refs::renamed($name, (string)($old['slug'] ?? ''), $data['slug']);
                if ($name === 'service_categories' && isset($data['name'])) Refs::categoryRenamed((string)($old['name'] ?? ''), $data['name']);
            }
            Guard::audit($u, 'update', $name, $id);
            Http::json(['id' => $id]);
        };
        $r->add('POST', "/api/admin/$name", fn() => $save(null));
        $r->add('PUT', "/api/admin/$name/{id}", fn($p) => $save($p['id']));
        $r->add('DELETE', "/api/admin/$name/{id}", function ($p) use ($name, $CONTENT_ROLES) {
            $u = Auth::require($CONTENT_ROLES);
            $oid = Db::oid($p['id']) ?? Http::error('Not found', 404);
            $doc = Db::col($name)->findOne(['_id' => $oid]) ?? Http::error('Not found', 404);
            if ($why = Refs::blocker($name, Db::ser($doc))) Http::error($why, 409);
            Db::col($name)->deleteOne(['_id' => $oid]);
            $note = Refs::detach($name, (string)($doc['slug'] ?? ''));
            Guard::audit($u, 'delete', $name, $p['id']);
            Http::json(['ok' => true, 'note' => $note]);
        });
    }

    // ---------- Leads & demos ----------
    $leadSpec = [
        'name' => ['type' => 'string', 'required' => true], 'email' => ['type' => 'email', 'required' => true],
        'phone' => ['type' => 'phone'], 'company' => ['type' => 'string'], 'industry' => ['type' => 'string'],
        'interest' => ['type' => 'string'], 'budget' => ['type' => 'string', 'max' => 60],
        'requirements' => ['type' => 'text', 'required' => true, 'max' => 4000],
        'contact_method' => ['type' => 'enum:email|phone|whatsapp'], 'consent' => ['type' => 'bool'],
        'subject' => ['type' => 'string', 'max' => 200], 'source_page' => ['type' => 'string', 'max' => 200],
    ];
    $demoSpec = [
        'name' => ['type' => 'string', 'required' => true], 'company' => ['type' => 'string', 'required' => true],
        'email' => ['type' => 'email', 'required' => true], 'phone' => ['type' => 'phone', 'required' => true],
        'industry' => ['type' => 'string'], 'interest' => ['type' => 'string'], 'locations' => ['type' => 'int'],
        'requirements' => ['type' => 'text', 'required' => true, 'max' => 4000],
        'preferred_time' => ['type' => 'string', 'max' => 100], 'source_page' => ['type' => 'string', 'max' => 200],
    ];
    $adminSpec = [
        'status' => ['type' => 'enum:new|contacted|demo_scheduled|proposal_sent|converted|closed'],
        'notes' => ['type' => 'text', 'max' => 5000], 'assigned_to' => ['type' => 'string'],
        'scheduled_date' => ['type' => 'string', 'max' => 40], 'outcome' => ['type' => 'text', 'max' => 2000],
    ];
    foreach (['leads' => $leadSpec, 'demos' => $demoSpec, 'applications' => []] as $col => $spec) {
        if ($spec) $r->add('POST', "/api/$col", function () use ($col, $spec) {
            Guard::rateLimit($col, 5, 3600);
            $b = Http::body();
            if (!empty($b['website'])) Http::json(['ok' => true]); // honeypot: pretend success to bots
            [$data, $err] = Guard::clean($b, $spec);
            if ($col === 'leads' && empty($data['consent'])) $err['consent'] = 'Please agree so we can contact you';
            if ($err) Http::error('Please fix the highlighted fields', 422, $err);
            // duplicate guard: same email + requirements within 10 minutes
            $dup = Db::col($col)->findOne(['email' => $data['email'], 'requirements' => $data['requirements'],
                'created_at' => ['$gte' => new \MongoDB\BSON\UTCDateTime((time() - 600) * 1000)]]);
            if (!$dup) Db::col($col)->insertOne($data + ['status' => 'new', 'created_at' => Db::now(), 'updated_at' => Db::now()]);
            Http::jsonThen(['ok' => true], 201, fn() => $dup ? null : Mailer::notify($col, $data));
        });
        $r->add('GET', "/api/admin/$col", function () use ($col) {
            Auth::require(['sales_manager']);
            $f = [];
            if (!empty($_GET['status'])) $f['status'] = (string)$_GET['status'];
            if (!empty($_GET['q'])) { $rx = new \MongoDB\BSON\Regex(preg_quote(mb_substr((string)$_GET['q'], 0, 60)), 'i');
                $f['$or'] = [['name' => $rx], ['email' => $rx], ['company' => $rx]]; }
            $page = max(1, (int)($_GET['page'] ?? 1)); $per = 20;
            $c = Db::col($col);
            $items = $c->find($f, ['sort' => ['created_at' => -1], 'limit' => $per, 'skip' => ($page - 1) * $per]);
            Http::json(['items' => Db::ser(iterator_to_array($items, false)), 'total' => $c->countDocuments($f), 'page' => $page, 'per' => $per]);
        });
        $r->add('GET', "/api/admin/$col/export", function () use ($col) {
            $u = Auth::require(['sales_manager']);
            Guard::audit($u, 'export', $col);
            header('Content-Type: text/csv; charset=utf-8');
            header("Content-Disposition: attachment; filename=$col.csv");
            $out = fopen('php://output', 'w');
            $cols = ['created_at', 'status', 'name', 'email', 'phone', 'company', 'industry', 'interest', 'requirements', 'source_page'];
            fputcsv($out, $cols);
            foreach (Db::col($col)->find([], ['sort' => ['created_at' => -1], 'limit' => 5000]) as $d) {
                $d = Db::ser($d);
                // neutralise spreadsheet formula injection
                fputcsv($out, array_map(fn($k) => preg_replace('/^([=+\-@])/', "'$1", (string)($d[$k] ?? '')), $cols));
            }
            exit;
        });
        $r->add('PATCH', "/api/admin/$col/{id}", function ($p) use ($col, $adminSpec) {
            $u = Auth::require(['sales_manager']);
            [$data, $err] = Guard::clean(Http::body(), $adminSpec, true);
            if ($err) Http::error('Invalid update', 422, $err);
            $oid = Db::oid($p['id']) ?? Http::error('Not found', 404);
            $data['updated_at'] = Db::now();
            Db::col($col)->updateOne(['_id' => $oid], ['$set' => $data]);
            Guard::audit($u, 'update', $col, $p['id']);
            Http::json(['ok' => true]);
        });
    }

    // ---------- Settings (admin) ----------
    $r->add('PUT', '/api/admin/settings', function () use ($CONTENT_ROLES) {
        $u = Auth::require($CONTENT_ROLES);
        [$data, $err] = Guard::clean(Http::body(), [
            'company_name' => ['type' => 'string'], 'tagline' => ['type' => 'string'], 'description' => ['type' => 'text', 'max' => 1000],
            'email' => ['type' => 'email'], 'phone' => ['type' => 'phone'], 'whatsapp' => ['type' => 'phone'], 'address' => ['type' => 'string', 'max' => 300],
            'hours' => ['type' => 'string'], 'currency' => ['type' => 'string', 'max' => 5],
            'linkedin' => ['type' => 'url'], 'facebook' => ['type' => 'url'], 'instagram' => ['type' => 'url'], 'x' => ['type' => 'url'],
            'hero_title' => ['type' => 'string'], 'hero_text' => ['type' => 'text', 'max' => 500], 'logo' => ['type' => 'url'], 'favicon' => ['type' => 'url'],
            'copyright' => ['type' => 'string', 'max' => 200], 'privacy_url' => ['type' => 'url'], 'terms_url' => ['type' => 'url'], 'analytics_id' => ['type' => 'string', 'max' => 40],
            'service_intro' => ['type' => 'text', 'max' => 400],
            'brand_navy' => ['type' => 'hex'], 'brand_teal' => ['type' => 'hex'], 'brand_amber' => ['type' => 'hex'], 'brand_cream' => ['type' => 'hex'],
            'notify_email' => ['type' => 'email'], 'email_from_name' => ['type' => 'string', 'max' => 80], 'og_image' => ['type' => 'url'],
            'seo_title' => ['type' => 'string', 'max' => 70], 'seo_description' => ['type' => 'string', 'max' => 170],
        ]);
        if ($err) Http::error('Please fix the highlighted fields', 422, $err);
        $data['updated_at'] = Db::now();
        Db::col('settings')->updateOne(['_id' => 'site'], ['$set' => $data], ['upsert' => true]);
        Guard::audit($u, 'update', 'settings', 'site');
        Http::json(['ok' => true]);
    });

    // ---------- Dashboard (real counts) ----------
    $r->add('GET', '/api/admin/dashboard', function () {
        $u = Auth::require(['content_manager', 'sales_manager']);
        $c = fn($n, $f = []) => Db::col($n)->countDocuments($f);
        $byStatus = [];
        foreach (Db::col('leads')->aggregate([['$group' => ['_id' => '$status', 'n' => ['$sum' => 1]]]]) as $g) $byStatus[(string)$g['_id']] = $g['n'];
        $recent = Db::col('audit_logs')->find([], ['sort' => ['created_at' => -1], 'limit' => 8]);
        Http::json([
            'enquiries' => $c('leads'), 'new_enquiries' => $c('leads', ['status' => 'new']), 'demos' => $c('demos'),
            'by_status' => $byStatus, 'products' => $c('products'), 'published_products' => $c('products', ['published' => true]),
            'published_posts' => $c('posts', ['status' => 'published']),
            'services' => $c('services'), 'published_services' => $c('services', ['status' => 'published']), 'draft_services' => $c('services', ['status' => 'draft']),
            'applications' => $c('applications', ['status' => 'new']), 'email_configured' => Mailer::configured(),
            'recent' => $u['role'] === 'sales_manager' ? [] : Db::ser(iterator_to_array($recent, false)),
        ]);
    });

    // ---------- Users (super admin only) ----------
    $r->add('GET', '/api/admin/users', function () {
        Auth::require(['__none__']);
        $out = [];
        foreach (Db::col('users')->find([], ['projection' => ['password_hash' => 0]]) as $d) $out[] = Db::ser($d);
        Http::json(['items' => $out]);
    });
    $r->add('POST', '/api/admin/users', function () {
        $u = Auth::require(['__none__']);
        [$d, $err] = Guard::clean(Http::body(), [
            'name' => ['type' => 'string', 'required' => true], 'email' => ['type' => 'email', 'required' => true],
            'role' => ['type' => 'enum:super_admin|content_manager|sales_manager', 'required' => true],
        ]);
        $pw = (string)(Http::body()['password'] ?? '');
        if (strlen($pw) < 12) $err['password'] = 'Use at least 12 characters';
        if ($err) Http::error('Please fix the highlighted fields', 422, $err);
        if (Db::col('users')->findOne(['email' => $d['email']])) Http::error('Email already registered', 422, ['email' => 'Already registered']);
        $d += ['password_hash' => password_hash($pw, PASSWORD_ARGON2ID), 'active' => true, 'created_at' => Db::now()];
        $id = (string)Db::col('users')->insertOne($d)->getInsertedId();
        Guard::audit($u, 'create', 'users', $id);
        Http::json(['id' => $id], 201);
    });
    // Update a user (super admin). Cannot lock yourself out or remove the last active super admin.
    $r->add('PUT', '/api/admin/users/{id}', function ($p) {
        $u = Auth::require(['__none__']);
        $b = Http::body();
        [$d, $err] = Guard::clean($b, [
            'name' => ['type' => 'string'], 'role' => ['type' => 'enum:super_admin|content_manager|sales_manager'], 'active' => ['type' => 'bool'],
        ], true);
        $pw = (string)($b['password'] ?? '');
        if ($pw !== '' && strlen($pw) < 12) $err['password'] = 'Use at least 12 characters';
        if ($err) Http::error('Please fix the highlighted fields', 422, $err);
        $oid = Db::oid($p['id']) ?? Http::error('Not found', 404);
        $target = Db::col('users')->findOne(['_id' => $oid]) ?? Http::error('Not found', 404);
        $losesAdmin = $target['role'] === 'super_admin' && ((isset($d['role']) && $d['role'] !== 'super_admin') || (array_key_exists('active', $d) && !$d['active']));
        if ($losesAdmin) {
            if ((string)$target['_id'] === $u['id']) Http::error('You cannot demote or deactivate your own account', 422);
            if (!Db::col('users')->countDocuments(['role' => 'super_admin', 'active' => true, '_id' => ['$ne' => $oid]])) Http::error('There must be at least one active Super Admin', 422);
        }
        if ($pw !== '') $d['password_hash'] = password_hash($pw, PASSWORD_ARGON2ID);
        if (!$d) Http::error('Nothing to update', 422);
        $d['updated_at'] = Db::now();
        Db::col('users')->updateOne(['_id' => $oid], ['$set' => $d]);
        Guard::audit($u, $pw !== '' ? 'update+password' : 'update', 'users', $p['id']);
        Http::json(['ok' => true]);
    });
    // Change your own password
    $r->add('POST', '/api/auth/password', function () {
        $u = Auth::require();
        Guard::rateLimit('password', 10, 900);
        $b = Http::body(); $new = (string)($b['password'] ?? '');
        $doc = Db::col('users')->findOne(['_id' => Db::oid($u['id'])]);
        if (!$doc || !password_verify((string)($b['current'] ?? ''), $doc['password_hash'])) Http::error('Your current password is not correct', 422, ['current' => 'Not correct']);
        if (strlen($new) < 12) Http::error('Use at least 12 characters', 422, ['password' => 'Use at least 12 characters']);
        Db::col('users')->updateOne(['_id' => $doc['_id']], ['$set' => ['password_hash' => password_hash($new, PASSWORD_ARGON2ID), 'updated_at' => Db::now()]]);
        Auth::start(); session_regenerate_id(true);
        Guard::audit($u, 'password_change', 'users', $u['id']);
        Http::json(['ok' => true]);
    });
    // ---------- Audit log (super admin) ----------
    $r->add('GET', '/api/admin/audit', function () {
        Auth::require(['__none__']);
        $page = max(1, (int)($_GET['page'] ?? 1)); $per = 30; $f = [];
        if (!empty($_GET['target'])) $f['target'] = (string)$_GET['target'];
        $c = Db::col('audit_logs');
        $items = $c->find($f, ['sort' => ['created_at' => -1], 'limit' => $per, 'skip' => ($page - 1) * $per]);
        Http::json(['items' => Db::ser(iterator_to_array($items, false)), 'total' => $c->countDocuments($f), 'page' => $page, 'per' => $per]);
    });
    // ---------- Media library ----------
    $r->add('GET', '/api/admin/media', function () {
        Auth::require(['content_manager']);
        $page = max(1, (int)($_GET['page'] ?? 1)); $per = 24;
        $c = Db::col('media');
        $items = $c->find([], ['sort' => ['created_at' => -1], 'limit' => $per, 'skip' => ($page - 1) * $per]);
        $out = array_map(fn($d) => $d + ['url' => '/uploads/' . $d['file']], Db::ser(iterator_to_array($items, false)));
        Http::json(['items' => $out, 'total' => $c->countDocuments([]), 'page' => $page, 'per' => $per]);
    });
    $r->add('DELETE', '/api/admin/media/{id}', function ($p) {
        $u = Auth::require(['content_manager']);
        $oid = Db::oid($p['id']) ?? Http::error('Not found', 404);
        $d = Db::col('media')->findOne(['_id' => $oid]) ?? Http::error('Not found', 404);
        $file = (string)$d['file'];
        if (!preg_match('/^[a-f0-9]{24}\.(jpg|png|webp|gif)$/', $file)) Http::error('Invalid file record', 422);
        if (($_GET['force'] ?? '') !== '1' && ($used = Refs::mediaUsage($file)))
            Http::error('This image is still used in: ' . implode('; ', array_slice($used, 0, 6)) . '. Remove it there first.', 409);
        $dir = App\Env::get('UPLOAD_DIR', __DIR__ . '/../uploads');
        @unlink("$dir/$file");
        Db::col('media')->deleteOne(['_id' => $oid]);
        Guard::audit($u, 'delete', 'media', $file);
        Http::json(['ok' => true]);
    });
    // ---------- Navigation (header tree + footer groups, built from admin data) ----------
    $r->add('GET', '/api/navigation', function () {
        $items = Db::ser(iterator_to_array(Db::col('nav_items')->find(['published' => true], ['sort' => ['order' => 1]]), false));
        $auto = function (string $kind): array {
            [$col, $f, $base] = match ($kind) {
                'services' => ['services', ['status' => 'published', 'show_in_menu' => true], '/services/'],
                'products' => ['products', ['published' => true], '/products/'],
                default => ['industries', ['published' => true], '/solutions/'],
            };
            $out = [];
            foreach (Db::col($col)->find($f, ['sort' => ['order' => 1, 'name' => 1], 'projection' => ['name' => 1, 'slug' => 1, 'short' => 1]]) as $d)
                $out[] = ['label' => $d['name'], 'url' => $base . $d['slug'], 'description' => $d['short'] ?? ''];
            return $out;
        };
        $header = [];
        foreach ($items as $it) {
            if ($it['group'] !== 'header' || !empty($it['parent'])) continue;
            $kids = array_values(array_filter($items, fn($c) => ($c['parent'] ?? '') === $it['id']));
            $it['children'] = array_merge($kids, ($it['auto_children'] ?? 'none') !== 'none' ? $auto($it['auto_children']) : []);
            $header[] = $it;
        }
        $footerServices = [];
        foreach (Db::col('services')->find(['status' => 'published', 'show_in_footer' => true], ['sort' => ['order' => 1, 'name' => 1]]) as $d)
            $footerServices[] = ['label' => $d['name'], 'url' => '/services/' . $d['slug']];
        Http::json([
            'header' => $header,
            'footer_quick' => array_values(array_filter($items, fn($i) => $i['group'] === 'footer_quick')),
            'footer_explore' => array_values(array_filter($items, fn($i) => $i['group'] === 'footer_explore')),
            'footer_services' => $footerServices,
        ]);
    });

    // ---------- Careers applications (public) ----------
    $r->add('POST', '/api/applications', function () {
        Guard::rateLimit('applications', 5, 3600);
        $b = Http::body();
        if (!empty($b['website'])) Http::json(['ok' => true]);
        [$d, $err] = Guard::clean($b, [
            'name' => ['type' => 'string', 'required' => true], 'email' => ['type' => 'email', 'required' => true], 'phone' => ['type' => 'phone'],
            'interest' => ['type' => 'string', 'required' => true], 'requirements' => ['type' => 'text', 'max' => 4000], 'resume_url' => ['type' => 'url'],
            'source_page' => ['type' => 'string', 'max' => 200],
        ]);
        if ($err) Http::error('Please fix the highlighted fields', 422, $err);
        Db::col('applications')->insertOne($d + ['status' => 'new', 'created_at' => Db::now(), 'updated_at' => Db::now()]);
        Http::jsonThen(['ok' => true], 201, fn() => Mailer::notify('applications', $d));
    });

    // ---------- Image upload (admin) + dev file serving ----------
    $r->add('POST', '/api/admin/upload', function () {
        $u = Auth::require(['content_manager']);
        Guard::rateLimit('upload', 60, 3600);
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) Http::error('Upload failed. Choose an image under 3 MB.', 422);
        if ($f['size'] > 3 * 1024 * 1024) Http::error('Image is larger than 3 MB', 422);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime] ?? null;
        if (!$ext || !@getimagesize($f['tmp_name'])) Http::error('Only JPG, PNG, WebP or GIF images are allowed', 422);
        $dir = App\Env::get('UPLOAD_DIR', __DIR__ . '/../uploads');
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $name = bin2hex(random_bytes(12)) . '.' . $ext;
        if (!move_uploaded_file($f['tmp_name'], "$dir/$name")) Http::error('Could not save the image on the server', 500);
        Db::col('media')->insertOne(['file' => $name, 'mime' => $mime, 'size' => $f['size'], 'by' => $u['email'], 'created_at' => Db::now()]);
        Guard::audit($u, 'upload', 'media', $name);
        Http::json(['url' => '/uploads/' . $name], 201);
    });
    $r->add('GET', '/uploads/{file}', function ($p) { // used in dev; in production Nginx serves /uploads directly
        $dir = App\Env::get('UPLOAD_DIR', __DIR__ . '/../uploads');
        if (!preg_match('/^[a-f0-9]{24}\.(jpg|png|webp|gif)$/', $p['file']) || !is_file("$dir/{$p['file']}")) Http::error('Not found', 404);
        header('Content-Type: ' . mime_content_type("$dir/{$p['file']}")); header('Cache-Control: public, max-age=31536000');
        readfile("$dir/{$p['file']}"); exit;
    });

    // ---------- sitemap.xml (published content only, with last-modified dates) ----------
    $r->add('GET', '/sitemap.xml', function () {
        $base = rtrim(App\Env::get('APP_URL', 'https://sindbadsolution.com'), '/');
        $urls = [];
        foreach (['/', '/products', '/solutions', '/services', '/pricing', '/portfolio', '/about', '/blog', '/contact', '/demo', '/careers', '/life-at-sindbad'] as $p) $urls[] = [$base . $p, null];
        foreach ([['services', ['status' => 'published'], '/services/'], ['products', ['published' => true], '/products/'], ['industries', ['published' => true], '/solutions/'],
                  ['posts', ['status' => 'published'], '/blog/']] as [$c, $f, $pre])
            foreach (Db::col($c)->find($f, ['projection' => ['slug' => 1, 'updated_at' => 1]]) as $d) {
                $ts = isset($d['updated_at']) && $d['updated_at'] instanceof \MongoDB\BSON\UTCDateTime ? $d['updated_at']->toDateTime()->format('Y-m-d') : null;
                $urls[] = [$base . $pre . $d['slug'], $ts];
            }
        header('Content-Type: application/xml; charset=utf-8'); header('Cache-Control: public, max-age=3600');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as [$u, $ts]) echo '<url><loc>' . htmlspecialchars($u, ENT_XML1) . '</loc>' . ($ts ? "<lastmod>$ts</lastmod>" : '') . '</url>';
        echo '</urlset>'; exit;
    });

    // ---------- Server-side SEO tags (nginx sends page requests here, see deploy/nginx.conf) ----------
    $r->add('GET', '/__seo', function () {
        $dist = App\Env::get('DIST_DIR', __DIR__ . '/../../client/dist');
        $file = rtrim($dist, '/') . '/index.html';
        if (!is_file($file)) { http_response_code(500); header('Content-Type: text/plain'); echo 'client/dist/index.html not found. Run npm run build.'; exit; }
        $base = rtrim(App\Env::get('APP_URL', 'https://sindbadsolution.com'), '/');
        $path = (string)(parse_url((string)($_SERVER['SEO_PATH'] ?? '/'), PHP_URL_PATH) ?: '/');
        $site = Db::ser(Db::col('settings')->findOne(['_id' => 'site']) ?? []);
        $all = Content::all();
        $find = function (string $col, array $f) use ($all) {
            $d = Db::col($col)->findOne(($all[$col]['public'] ?? []) + $f);
            return $d ? Db::ser($d) : null;
        };
        $res = PageMeta::build($path, $site, $base, $find);
        http_response_code($res['status']);
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: public, max-age=300');
        echo PageMeta::inject((string)file_get_contents($file), $res['meta'], $base, (string)($site['company_name'] ?? 'Sindbad Solution'));
        exit;
    });
};
