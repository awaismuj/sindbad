<?php
declare(strict_types=1);
namespace App;

/** Admin-editable collections. Adding a content type = one entry here + one in client/src/lib/schema.ts. */
final class Content {
    public const SECTIONS = ['overview', 'problems', 'offerings', 'features', 'benefits', 'industries', 'technologies', 'process', 'deliverables', 'engagement', 'faqs', 'case_studies', 'related'];
    public static function all(): array {
        $seo = ['seo_title' => ['type' => 'string', 'max' => 70], 'seo_description' => ['type' => 'string', 'max' => 170], 'og_image' => ['type' => 'url']];
        $pub = ['published' => ['type' => 'bool'], 'order' => ['type' => 'int']];
        return [
            'services' => ['slugFrom' => 'name', 'public' => ['status' => 'published'], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'category' => ['type' => 'string'], 'short' => ['type' => 'string', 'max' => 300],
                'icon' => ['type' => 'string', 'max' => 40], 'hero_heading' => ['type' => 'string'], 'hero_subheading' => ['type' => 'string', 'max' => 400],
                'hero_image' => ['type' => 'url'], 'content' => ['type' => 'html'],
                'problems' => ['type' => 'array'], 'offerings' => ['type' => 'array'], 'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'industries' => ['type' => 'array'], 'technologies' => ['type' => 'array'], 'process' => ['type' => 'json'],
                'deliverables' => ['type' => 'array'], 'engagement' => ['type' => 'array'], 'faqs' => ['type' => 'json'],
                'case_studies' => ['type' => 'array'], 'related_services' => ['type' => 'array'], 'related_products' => ['type' => 'array'],
                'cta_heading' => ['type' => 'string'], 'cta_text' => ['type' => 'string', 'max' => 400],
                'sections' => ['type' => 'array'],
                'status' => ['type' => 'enum:draft|published|unpublished', 'required' => true],
                'featured' => ['type' => 'bool'], 'show_in_menu' => ['type' => 'bool'], 'show_in_footer' => ['type' => 'bool'], 'order' => ['type' => 'int'],
            ] + $seo],
            'service_categories' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'], 'description' => ['type' => 'string', 'max' => 300],
            ] + $pub],
            'products' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'category' => ['type' => 'string'], 'short' => ['type' => 'string', 'max' => 300],
                'description' => ['type' => 'html'], 'image' => ['type' => 'url'],
                'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'status' => ['type' => 'enum:available|coming_soon|custom|private_demo', 'required' => true],
                'pricing_model' => ['type' => 'string'], 'featured' => ['type' => 'bool'], 'demo' => ['type' => 'bool'],
                'faqs' => ['type' => 'json'],
            ] + $seo + $pub],
            'industries' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1, 'name' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'headline' => ['type' => 'string'], 'description' => ['type' => 'html'], 'icon' => ['type' => 'string', 'max' => 40], 'image' => ['type' => 'url'],
                'problems' => ['type' => 'array'], 'features' => ['type' => 'array'], 'benefits' => ['type' => 'array'],
                'related_services' => ['type' => 'array'], 'related_products' => ['type' => 'array'], 'faqs' => ['type' => 'json'],
            ] + $seo + $pub],
            'plans' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'], 'product_slug' => ['type' => 'string'],
                'price' => ['type' => 'number'], 'discount' => ['type' => 'number'], 'setup_fee' => ['type' => 'number'],
                'currency' => ['type' => 'string', 'max' => 5], 'interval' => ['type' => 'enum:one_time|monthly|annual|custom'],
                'features' => ['type' => 'array'], 'optional_features' => ['type' => 'array'], 'contact_sales' => ['type' => 'bool'],
            ] + $pub],
            'posts' => ['slugFrom' => 'title', 'public' => ['status' => 'published'], 'sort' => ['published_at' => -1], 'fields' => [
                'title' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'excerpt' => ['type' => 'string', 'max' => 400], 'content' => ['type' => 'html'], 'author' => ['type' => 'string'],
                'image' => ['type' => 'url'], 'category' => ['type' => 'string'], 'tags' => ['type' => 'array'],
                'status' => ['type' => 'enum:draft|published', 'required' => true],
            ] + $seo],
            'portfolio' => ['slugFrom' => 'name', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'name' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'],
                'industry' => ['type' => 'string'], 'description' => ['type' => 'html'], 'challenges' => ['type' => 'text'], 'solution' => ['type' => 'text'],
                'technologies' => ['type' => 'array'], 'deliverables' => ['type' => 'array'], 'image' => ['type' => 'url'],
                'outcomes' => ['type' => 'text'], 'url' => ['type' => 'url'],
            ] + $pub],
            'faqs' => ['slugFrom' => 'question', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'question' => ['type' => 'string', 'required' => true, 'max' => 300], 'answer' => ['type' => 'text', 'required' => true], 'page' => ['type' => 'string', 'max' => 60],
            ] + $pub],
            'jobs' => ['slugFrom' => 'title', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'title' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'], 'department' => ['type' => 'string'],
                'location' => ['type' => 'string'], 'employment_type' => ['type' => 'enum:full_time|part_time|contract|internship'],
                'description' => ['type' => 'html'], 'requirements' => ['type' => 'array'], 'deadline' => ['type' => 'string', 'max' => 20],
            ] + $pub],
            // Free-form content pages: about, life-at-sindbad, careers (intro). Cards = [{title,text,image}] blocks.
            'pages' => ['slugFrom' => 'title', 'public' => ['published' => true], 'sort' => ['title' => 1], 'fields' => [
                'title' => ['type' => 'string', 'required' => true], 'slug' => ['type' => 'string'], 'intro' => ['type' => 'text', 'max' => 1000],
                'content' => ['type' => 'html'], 'image' => ['type' => 'url'], 'cards' => ['type' => 'json'],
                'mission' => ['type' => 'text', 'max' => 1000], 'vision' => ['type' => 'text', 'max' => 1000], 'values' => ['type' => 'array'],
                'gallery' => ['type' => 'array'],
            ] + $seo + ['published' => ['type' => 'bool']]],
            'nav_items' => ['slugFrom' => 'label', 'public' => ['published' => true], 'sort' => ['order' => 1], 'fields' => [
                'label' => ['type' => 'string', 'required' => true], 'url' => ['type' => 'string', 'required' => true, 'max' => 500],
                'group' => ['type' => 'enum:header|footer_quick|footer_explore', 'required' => true],
                'parent' => ['type' => 'string', 'max' => 40], 'auto_children' => ['type' => 'enum:none|services|products|solutions'],
                'desktop' => ['type' => 'bool'], 'mobile' => ['type' => 'bool'], 'cta' => ['type' => 'bool'],
            ] + $pub],
        ];
    }
}
