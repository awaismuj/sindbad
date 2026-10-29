<?php
declare(strict_types=1);
namespace App;

final class Env {
    private static array $vars = [];
    public static function load(string $file): void {
        if (!is_file($file)) return;
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
            [$k, $v] = explode('=', $line, 2);
            self::$vars[trim($k)] = trim($v, " \t\"'");
        }
    }
    public static function get(string $key, ?string $default = null): ?string {
        return self::$vars[$key] ?? getenv($key) ?: $default;
    }
}
