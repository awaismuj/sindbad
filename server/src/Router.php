<?php
declare(strict_types=1);
namespace App;

final class Router {
    private array $routes = [];
    public function add(string $method, string $path, callable $handler): void {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $path) . '$#';
        $this->routes[] = [$method, $regex, $handler];
    }
    public function dispatch(string $method, string $uri): void {
        $path = rtrim(parse_url($uri, PHP_URL_PATH) ?: '/', '/') ?: '/';
        foreach ($this->routes as [$m, $regex, $h]) {
            if ($m === $method && preg_match($regex, $path, $mm)) {
                $params = array_filter($mm, 'is_string', ARRAY_FILTER_USE_KEY);
                $h($params);
                return;
            }
        }
        Http::error('Not found', 404);
    }
}
