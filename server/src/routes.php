<?php
declare(strict_types=1);

use App\{Auth, Content, Db, Guard, Http, Router};

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
            $cur = Db::col($name)->find([], ['sort' => ['updated_at' => -1], 'limit' => 200, 'projection' => ['content' => 0]]);
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
            if (empty($data['slug']) && isset($cfg['fields']['slug'])) {
                if ($id === null) $data['slug'] = Guard::slug((string)($data[$cfg['slugFrom']] ?? ''));
            } elseif (isset($data['slug'])) $data['slug'] = Guard::slug($data['slug']);
            if (!empty($data['slug'])) {
                $dup = $col->findOne(['slug' => $data['slug']] + ($id ? ['_id' => ['$ne' => Db::oid($id)]] : []));
                if ($dup) Http::error('That URL slug is already used', 422, ['slug' => 'Already in use']);
            }
            $data['updated_at'] = Db::now();
            if ($name === 'posts' && ($data['status'] ?? '') === 'published') $data['published_at'] = Db::now();
            if ($id === null) {
                $data['created_at'] = Db::now();
                if (array_key_exists('published', $cfg['fields']) && !isset($data['published'])) $data['published'] = false;
                $res = $col->insertOne($data);
                $newId = (string)$res->getInsertedId();
                Guard::audit($u, 'create', $name, $newId);
                Http::json(['id' => $newId], 201);
            }
            $oid = Db::oid($id) ?? Http::error('Not found', 404);
            $col->updateOne(['_id' => $oid], ['$set' => $data]);
            Guard::audit($u, 'update', $name, $id);
            Http::json(['id' => $id]);
        };
        $r->add('POST', "/api/admin/$name", fn() => $save(null));
        $r->add('PUT', "/api/admin/$name/{id}", fn($p) => $save($p['id']));
        $r->add('DELETE', "/api/admin/$name/{id}", function ($p) use ($name, $CONTENT_ROLES) {
            $u = Auth::require($CONTENT_ROLES);
            $oid = Db::oid($p['id']) ?? Http::error('Not found', 404);
            Db::col($name)->deleteOne(['_id' => $oid]);
            Guard::audit($u, 'delete', $name, $p['id']);
            Http::json(['ok' => true]);
        });
    }

    // ---------- Leads & demos ----------
    $leadSpec = [
        'name' => ['type' => 'string', 'required' => true], 'email' => ['type' => 'email', 'required' => true],
        'phone' => ['type' => 'phone'], 'company' => ['type' => 'string'], 'industry' => ['type' => 'string'],
        'interest' => ['type' => 'string'], 'budget' => ['type' => 'string', 'max' => 60],
        'requirements' => ['type' => 'text', 'required' => true, 'max' => 4000],
        'contact_method' => ['type' => 'enum:email|phone|whatsapp'], 'consent' => ['type' => 'bool'],
        'source_page' => ['type' => 'string', 'max' => 200],
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
    foreach (['leads' => $leadSpec, 'demos' => $demoSpec] as $col => $spec) {
        $r->add('POST', "/api/$col", function () use ($col, $spec) {
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
            Http::json(['ok' => true], 201);
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
            'hero_title' => ['type' => 'string'], 'hero_text' => ['type' => 'text', 'max' => 500],
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
};
