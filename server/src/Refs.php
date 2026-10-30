<?php
declare(strict_types=1);
namespace App;

/**
 * Keeps links between records safe:
 *  - renaming a slug updates menu links and "related" lists that pointed at the old slug
 *  - deleting a record removes it from "related" lists and switches off menu links to it (nothing is left dangling)
 *  - a few deletions are refused while something still depends on the record
 */
final class Refs {
    private const URL = ['services' => '/services/', 'products' => '/products/', 'industries' => '/solutions/'];
    /** collection => list of [referencing collection, field] where the field is an array of slugs */
    private const LISTS = [
        'services' => [['services', 'related_services'], ['industries', 'related_services']],
        'products' => [['services', 'related_products'], ['industries', 'related_products']],
        'portfolio' => [['services', 'case_studies']],
    ];

    public static function tracked(string $col): bool { return isset(self::URL[$col]) || isset(self::LISTS[$col]) || $col === 'service_categories'; }

    public static function renamed(string $col, string $old, string $new): void {
        if ($old === $new || $old === '') return;
        foreach (self::LISTS[$col] ?? [] as [$c, $f])
            Db::col($c)->updateMany([$f => $old], ['$set' => ["$f.$" => $new]]);
        if (isset(self::URL[$col])) Db::col('nav_items')->updateMany(['url' => self::URL[$col] . $old], ['$set' => ['url' => self::URL[$col] . $new, 'updated_at' => Db::now()]]);
        if ($col === 'products') Db::col('plans')->updateMany(['product_slug' => $old], ['$set' => ['product_slug' => $new]]);
    }

    /** Category renamed: services follow it. */
    public static function categoryRenamed(string $old, string $new): void {
        if ($old !== '' && $old !== $new) Db::col('services')->updateMany(['category' => $old], ['$set' => ['category' => $new]]);
    }

    /** Returns a human-readable reason when the record must not be deleted yet, otherwise null. */
    public static function blocker(string $col, array $doc): ?string {
        if ($col === 'products' && ($n = Db::col('plans')->countDocuments(['product_slug' => $doc['slug'] ?? '']))) return "$n pricing plan(s) belong to this product. Move or delete them first, or set the product to unpublished instead.";
        if ($col === 'service_categories' && ($n = Db::col('services')->countDocuments(['category' => $doc['name'] ?? '']))) return "$n service(s) use this category. Move them to another category first.";
        return null;
    }

    /** Tidy up after a delete. Returns a short summary for the admin. */
    public static function detach(string $col, string $slug): string {
        if ($slug === '') return '';
        $notes = [];
        foreach (self::LISTS[$col] ?? [] as [$c, $f]) {
            $r = Db::col($c)->updateMany([$f => $slug], ['$pull' => [$f => $slug]]);
            if ($r->getModifiedCount()) $notes[] = $r->getModifiedCount() . " related list(s) updated";
        }
        if (isset(self::URL[$col])) {
            $r = Db::col('nav_items')->updateMany(['url' => self::URL[$col] . $slug, 'published' => true], ['$set' => ['published' => false, 'updated_at' => Db::now()]]);
            if ($r->getModifiedCount()) $notes[] = $r->getModifiedCount() . " menu link(s) switched off";
        }
        return implode(', ', $notes);
    }

    /** Where a media file is used (searches the JSON of the content collections; fine at the size of a company site). */
    public static function mediaUsage(string $file): array {
        $used = [];
        foreach (['services', 'products', 'industries', 'posts', 'portfolio', 'pages', 'plans', 'settings'] as $c) {
            foreach (Db::col($c)->find([]) as $d) {
                $json = json_encode(Db::ser($d), JSON_UNESCAPED_SLASHES);
                if ($json !== false && str_contains($json, $file)) {
                    $label = $c === 'settings' ? 'Site settings' : ucfirst($c) . ': ' . ($d['name'] ?? $d['title'] ?? $d['slug'] ?? '');
                    $used[] = $label;
                }
            }
        }
        return $used;
    }
}
