<?php
declare(strict_types=1);
namespace App;

/** Config for admin-editable collections. Adding a new content type = adding one entry here (and one in client/src/lib/schema.ts). */
final class Content {
    private const SEO = [
        'seo_title' => ['type' => 'string', 'max' => 70],
        'seo_description' => ['type' => 'string', 'max' => 170],
    ];
    public static function all(): array {
        $s = self::SEO;
        $pub = ['published' => ['type' => 'bool'], 'order' => ['type' => 'int']];
        return [
            'products' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'category' => ['type' => 'string'], 'short' => ['type' => 'string', 'max' => 300],
                'description' => ['type' => 'text'], 'image' => ['type' => 'url'],
                'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'status' => ['type' => 'enum:available|coming_soon|custom|private_demo', 'required' => true],
                'pricing_model' => ['type' => 'string'], 'featured' => ['type' => 'bool'],
                'faqs' => ['type' => 'json'], 'demo' => ['type' => 'bool'],
            ] + $s + $pub],
            'industries' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'headline' => ['type' => 'string'], 'description' => ['type' => 'text'], 'icon' => ['type' => 'string', 'max' => 40], 'image' => ['type' => 'url'],
                'problems' => ['type' => 'array'], 'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'faqs' => ['type' => 'json'],
            ] + $s + $pub],
            'services' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'category' => ['type' => 'string'], 'short' => ['type' => 'string', 'max' => 300],
                'description' => ['type' => 'text', 'max' => 20000],
                'hero_heading' => ['type' => 'string', 'max' => 180], 'hero_subheading' => ['type' => 'text', 'max' => 1000],
                'hero_image' => ['type' => 'url'], 'image' => ['type' => 'url'],
                'problems' => ['type' => 'array'], 'offers' => ['type' => 'array'],
                'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'industries' => ['type' => 'array'], 'technologies' => ['type' => 'array'],
                'process' => ['type' => 'array'], 'deliverables' => ['type' => 'array'],
                'engagement_models' => ['type' => 'array'], 'faqs' => ['type' => 'json'],
                'case_studies' => ['type' => 'array'], 'related_services' => ['type' => 'array'],
                'related_products' => ['type' => 'array'],
                'cta_heading' => ['type' => 'string', 'max' => 180], 'cta_description' => ['type' => 'text', 'max' => 1000],
                'seo_title' => ['type' => 'string', 'max' => 70], 'seo_description' => ['type' => 'string', 'max' => 170],
                'og_image' => ['type' => 'url'],
                'status' => ['type' => 'enum:draft|published|unpublished'],
                'published' => ['type' => 'bool'], 'featured' => ['type' => 'bool'],
                'menu_visible' => ['type' => 'bool'], 'footer_visible' => ['type' => 'bool'],
                'order' => ['type' => 'int'],
            ]],
            'pages' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'title' => ['type' => 'string'], 'short' => ['type' => 'string', 'max' => 500],
                'content' => ['type' => 'text', 'max' => 50000], 'image' => ['type' => 'url'],
                'published' => ['type' => 'bool'], 'order' => ['type' => 'int'],
            ] + $s],
            'clients' => ['slugFrom' => 'name', 'public' => ['active' => true, 'show_on_homepage' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true, 'max' => 160],
                'logo' => ['type' => 'url', 'required' => true],
                'website_url' => ['type' => 'url'],
                'description' => ['type' => 'string', 'max' => 500],
                'industry' => ['type' => 'string', 'max' => 100],
                'order' => ['type' => 'int'],
                'featured' => ['type' => 'bool'],
                'active' => ['type' => 'bool'],
                'show_on_homepage' => ['type' => 'bool'],
            ]],
            'plans' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'product_slug' => ['type' => 'string'],
                'price' => ['type' => 'number'], 'discount' => ['type' => 'number'], 'setup_fee' => ['type' => 'number'],
                'currency' => ['type' => 'string', 'max' => 5],
                'interval' => ['type' => 'enum:one_time|monthly|annual|custom'],
                'features' => ['type' => 'array'], 'optional_features' => ['type' => 'array'],
                'contact_sales' => ['type' => 'bool'],
            ] + $pub],
            'posts' => ['slugFrom' => 'title', 'public' => ['status' => 'published'], 'sort' => ['published_at' => -1], 'fields' => [
                'title' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'excerpt' => ['type' => 'string', 'max' => 400], 'content' => ['type' => 'text', 'max' => 100000],
                'image' => ['type' => 'url'], 'category' => ['type' => 'string'], 'tags' => ['type' => 'array'],
                'status' => ['type' => 'enum:draft|published', 'required' => true],
            ] + $s],
            'portfolio' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'industry' => ['type' => 'string'], 'description' => ['type' => 'text'],
                'challenges' => ['type' => 'text'], 'solution' => ['type' => 'text'],
                'technologies' => ['type' => 'array'], 'image' => ['type' => 'url'],
                'outcomes' => ['type' => 'text'], 'url' => ['type' => 'url'],
            ] + $pub],
            'faqs' => ['slugFrom' => 'question', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'question' => ['type' => 'string', 'required' => true, 'max' => 300], 'answer' => ['type' => 'text', 'required' => true],
                'page' => ['type' => 'string', 'max' => 60],
            ] + $pub],
        ];
    }
}
