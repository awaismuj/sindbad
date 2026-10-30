<?php
declare(strict_types=1);
namespace App;

final class Http {
    public static function body(): array {
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '' || strlen($raw) > 1_000_000) return [];
        $d = json_decode($raw, true);
        return is_array($d) ? $d : [];
    }
    public static function json(mixed $data, int $status = 200): never {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    /** Send the response now, then run slow follow-up work (e.g. e-mail) without keeping the visitor waiting. */
    public static function jsonThen(mixed $data, int $status, callable $after): never {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        $out = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        header('Content-Length: ' . strlen($out));
        header('Connection: close');
        echo $out;
        if (function_exists('fastcgi_finish_request')) fastcgi_finish_request(); else { @ob_end_flush(); flush(); }
        try { $after(); } catch (\Throwable $e) { error_log((string)$e); }
        exit;
    }
    public static function error(string $msg, int $status = 400, array $fields = []): never {
        self::json(['error' => $msg, 'fields' => (object)$fields], $status);
    }
    public static function ip(): string {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; // Nginx sets REMOTE_ADDR via real_ip if behind a proxy
    }
}
