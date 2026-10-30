<?php
declare(strict_types=1);
namespace App;

/**
 * Server-side SEO for the React app. Crawlers and social-share bots do not run JavaScript, so nginx sends
 * every page request through here: we read client/dist/index.html and inject the title, description,
 * canonical URL, Open Graph tags and JSON-LD built from the database. The React app then takes over as usual.
 * Unknown or unpublished detail pages get a real HTTP 404 (the React app still shows its friendly page).
 * JSON-LD is only built from fields the administrator actually filled in.
 */
final class PageMeta {
    private const STATIC = [
        '/services' => ['Services', 'Cloud, software development, AI, automation, marketing and more.'],
        '/products' => ['Products', 'Ready-made business software.'],
        '/solutions' => ['Industry solutions', 'Software solutions for restaurants, pharmacies, retail, warehouses and more.'],
        '/pricing' => ['Pricing', 'Flexible pricing: one-time purchase, subscriptions, setup and custom quotations.'],
        '/portfolio' => ['Portfolio', 'Projects delivered by our team.'],
        '/blog' => ['Blog', 'Articles and resources on business software and automation.'],
        '/contact' => ['Contact', 'Talk to our team.'],
        '/demo' => ['Request a demo', 'Book a free demo of our software.'],
    ];
    private const PAGES = ['/' => 'home', '/about' => 'about', '/careers' => 'careers', '/life-at-sindbad' => 'life-at-sindbad'];
    private const PAGE_TITLES = ['home' => '', 'about' => 'About us', 'careers' => 'Careers', 'life-at-sindbad' => 'Life at Sindbad Solution'];
    private const DETAIL = ['services' => 'services', 'products' => 'products', 'solutions' => 'industries', 'blog' => 'posts'];

    /**
     * @param callable(string,array):?array $find  fn(collection, filter): ?document (already serialised, public documents only)
     * @return array{status:int, meta:array}
     */
    public static function build(string $path, array $site, string $base, callable $find): array {
        $path = '/' . trim($path, '/');
        $name = (string)($site['company_name'] ?? 'Sindbad Solution');
        $meta = ['title' => '', 'description' => (string)($site['seo_description'] ?? $site['description'] ?? ''), 'image' => $site['og_image'] ?? $site['logo'] ?? null,
            'type' => 'website', 'noindex' => false, 'ld' => [], 'path' => $path];
        $status = 200;
        $org = array_filter([
            '@type' => 'Organization', 'name' => $name, 'url' => $base . '/', 'logo' => !empty($site['logo']) ? self::abs($base, $site['logo']) : null,
            'email' => $site['email'] ?? null, 'telephone' => $site['phone'] ?? null,
            'sameAs' => array_values(array_filter([$site['linkedin'] ?? null, $site['facebook'] ?? null, $site['instagram'] ?? null, $site['x'] ?? null])) ?: null,
        ]);
        if ($path === '/' || $path === '/index.html') {
            $meta['title'] = (string)($site['seo_title'] ?? ''); $meta['path'] = '/';
            if (!empty($site['hero_text']) && empty($site['seo_description'])) $meta['description'] = (string)$site['hero_text'];
            $meta['ld'][] = $org + ['@context' => 'https://schema.org'];
        } elseif (str_starts_with($path, '/admin')) {
            $meta['noindex'] = true; $meta['title'] = 'Admin';
        } elseif (isset(self::STATIC[$path])) {
            [$meta['title'], $meta['description']] = self::STATIC[$path];
        } elseif (isset(self::PAGES[$path])) {
            $slug = self::PAGES[$path];
            $p = $find('pages', ['slug' => $slug]);
            $meta['title'] = ($p['seo_title'] ?? '') ?: self::PAGE_TITLES[$slug];
            $meta['description'] = ($p['seo_description'] ?? '') ?: ($p['intro'] ?? '') ?: $meta['description'];
            $meta['image'] = ($p['og_image'] ?? null) ?: $meta['image'];
        } elseif (preg_match('#^/(services|products|solutions|blog)/([a-z0-9\-]+)$#', $path, $m)) {
            $col = self::DETAIL[$m[1]];
            $d = $find($col, ['slug' => $m[2]]);
            if (!$d) { $status = 404; $meta['title'] = 'Page not found'; $meta['noindex'] = true; }
            else {
                $title = $d['seo_title'] ?? '' ?: ($d['name'] ?? $d['title'] ?? '');
                $desc = ($d['seo_description'] ?? '') ?: ($d['short'] ?? '') ?: ($d['headline'] ?? '') ?: ($d['excerpt'] ?? '');
                $meta['title'] = $title; $meta['description'] = $desc ?: $meta['description'];
                $meta['image'] = ($d['og_image'] ?? '') ?: ($d['hero_image'] ?? '') ?: ($d['image'] ?? '') ?: $meta['image'];
                $url = $base . $path; $label = $d['name'] ?? $d['title'] ?? '';
                $crumbs = ['@type' => 'BreadcrumbList', '@context' => 'https://schema.org', 'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => ucfirst($m[1]), 'item' => $base . '/' . $m[1]],
                    ['@type' => 'ListItem', 'position' => 3, 'name' => $label, 'item' => $url]]];
                $meta['ld'][] = $crumbs;
                if ($m[1] === 'services') $meta['ld'][] = array_filter(['@context' => 'https://schema.org', '@type' => 'Service', 'name' => $label,
                    'description' => $desc ?: null, 'url' => $url, 'serviceType' => $d['category'] ?? null, 'provider' => ['@type' => 'Organization', 'name' => $name, 'url' => $base . '/']]);
                if ($m[1] === 'blog') { $meta['type'] = 'article';
                    $meta['ld'][] = array_filter(['@context' => 'https://schema.org', '@type' => 'BlogPosting', 'headline' => $label, 'description' => $desc ?: null,
                        'datePublished' => $d['published_at'] ?? null, 'dateModified' => $d['updated_at'] ?? null, 'url' => $url,
                        'image' => $meta['image'] ? self::abs($base, (string)$meta['image']) : null,
                        'author' => !empty($d['author']) ? ['@type' => 'Person', 'name' => $d['author']] : ['@type' => 'Organization', 'name' => $name],
                        'publisher' => ['@type' => 'Organization', 'name' => $name]]); }
            }
        } else { $status = 404; $meta['title'] = 'Page not found'; $meta['noindex'] = true; }
        return ['status' => $status, 'meta' => $meta];
    }

    private static function abs(string $base, string $u): string { return preg_match('#^https?://#i', $u) ? $u : $base . '/' . ltrim($u, '/'); }
    private static function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

    public static function inject(string $html, array $meta, string $base, string $siteName): string {
        $title = $meta['title'] !== '' ? $meta['title'] . ' | ' . $siteName : $siteName . ' | Software, cloud, AI and automation';
        $url = $base . ($meta['path'] === '/' ? '/' : $meta['path']);
        $desc = mb_substr(trim(strip_tags((string)$meta['description'])), 0, 300);
        $tags = [];
        $tags[] = '<meta name="description" content="' . self::e($desc) . '" />';
        if ($meta['noindex']) $tags[] = '<meta name="robots" content="noindex, nofollow" />';
        else $tags[] = '<link rel="canonical" href="' . self::e($url) . '" />';
        $tags[] = '<meta property="og:site_name" content="' . self::e($siteName) . '" />';
        $tags[] = '<meta property="og:title" content="' . self::e($title) . '" />';
        $tags[] = '<meta property="og:description" content="' . self::e($desc) . '" />';
        $tags[] = '<meta property="og:type" content="' . self::e($meta['type']) . '" />';
        $tags[] = '<meta property="og:url" content="' . self::e($url) . '" />';
        if (!empty($meta['image'])) {
            $tags[] = '<meta property="og:image" content="' . self::e(self::abs($base, (string)$meta['image'])) . '" />';
            $tags[] = '<meta name="twitter:card" content="summary_large_image" />';
        }
        if ($meta['ld'] && !$meta['noindex']) {
            // JSON_HEX_* keeps "</script>" and quotes inside values from breaking out of the tag
            $json = json_encode(count($meta['ld']) === 1 ? $meta['ld'][0] : $meta['ld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
            $tags[] = '<script type="application/ld+json" id="ld-json" data-path="' . self::e($meta['path']) . '">' . $json . '</script>';
        }
        // Replace what index.html already has, then add the rest before </head>
        $html = preg_replace('#<title>.*?</title>#is', '<title>' . self::e($title) . '</title>', $html, 1);
        $html = preg_replace('#<meta\s+name="description"[^>]*>\s*#i', '', $html);
        return str_replace('</head>', "    " . implode("\n    ", $tags) . "\n  </head>", $html);
    }
}
