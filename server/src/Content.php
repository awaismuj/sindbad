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
                'description' => ['type' => 'text'], 'benefits' => ['type' => 'array'], 'deliverables' => ['type' => 'array'],
            ] + $s + $pub],
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
