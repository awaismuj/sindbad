<?php
declare(strict_types=1);
namespace App;

/** Rate limiting (Mongo-backed, TTL-expired), audit log and validators. */
final class Guard {
    public static function rateLimit(string $bucket, int $max, int $windowSec): void {
        $key = $bucket . ':' . Http::ip();
        $col = Db::col('rate_limits');
        $doc = $col->findOneAndUpdate(
            ['_id' => $key],
            ['$inc' => ['n' => 1], '$setOnInsert' => ['expires_at' => new \MongoDB\BSON\UTCDateTime((time() + $windowSec) * 1000)]],
            ['upsert' => true, 'returnDocument' => \MongoDB\Operation\FindOneAndUpdate::RETURN_DOCUMENT_AFTER]
        );
        if (($doc['n'] ?? 0) > $max) {
            header('Retry-After: ' . $windowSec);
            Http::error('Too many requests. Please try again later.', 429);
        }
    }
    public static function audit(?array $user, string $action, string $target, ?string $id = null): void {
        Db::col('audit_logs')->insertOne([
            'user_id' => $user['id'] ?? null, 'user_email' => $user['email'] ?? null,
            'action' => $action, 'target' => $target, 'target_id' => $id,
            'ip' => Http::ip(), 'created_at' => Db::now(),
        ]);
    }
    public static function slug(string $s): string {
        $s = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $s), '-'));
        return $s !== '' ? $s : 'item-' . substr(bin2hex(random_bytes(3)), 0, 6);
    }
    /**
     * Validate + coerce input against a field spec. Returns [clean, errors].
     * Spec types: string, text, bool, int, number, array, json, email, phone, enum:a|b, url, hex
     */
    public static function clean(array $in, array $spec, bool $partial = false): array {
        $out = []; $err = [];
        foreach ($spec as $name => $rule) {
            [$type, $req] = [$rule['type'], $rule['required'] ?? false];
            $has = array_key_exists($name, $in);
            if (!$has) { if ($req && !$partial) $err[$name] = 'Required'; continue; }
            $v = $in[$name];
            $empty = $v === null || $v === '' || $v === [];
            if ($empty) {
                if ($req) { $err[$name] = 'Required'; continue; }
                $out[$name] = in_array($type, ['bool'], true) ? false : (in_array($type, ['array', 'json'], true) ? [] : null);
                continue;
            }
            $max = $rule['max'] ?? ($type === 'text' ? 20000 : 300);
            switch (true) {
                case $type === 'string' || $type === 'text':
                    $v = trim((string)$v);
                    if (mb_strlen($v) > $max) { $err[$name] = "Max $max characters"; break; }
                    $out[$name] = $v; break;
                case $type === 'email':
                    $v = strtolower(trim((string)$v));
                    if (!filter_var($v, FILTER_VALIDATE_EMAIL) || strlen($v) > 190) { $err[$name] = 'Enter a valid email address'; break; }
                    $out[$name] = $v; break;
                case $type === 'phone':
                    $v = trim((string)$v);
                    if (!preg_match('/^[+0-9 ()\-]{6,25}$/', $v)) { $err[$name] = 'Enter a valid phone number'; break; }
                    $out[$name] = $v; break;
                case $type === 'url':
                    $v = trim((string)$v);
                    if (!preg_match('#^(https?://|/)#i', $v) || strlen($v) > 500) { $err[$name] = 'Enter a valid URL'; break; }
                    $out[$name] = $v; break;
                case $type === 'hex':
                    $v = strtolower(trim((string)$v));
                    if (!preg_match('/^#[0-9a-f]{6}$/', $v)) { $err[$name] = 'Use a colour like #0B1F3A'; break; }
                    $out[$name] = $v; break;
                case $type === 'html':
                    $v = Sanitizer::clean(substr((string)$v, 0, 200000));
                    $out[$name] = $v; break;
                case $type === 'bool': $out[$name] = filter_var($v, FILTER_VALIDATE_BOOLEAN); break;
                case $type === 'int':
                    if (filter_var($v, FILTER_VALIDATE_INT) === false) { $err[$name] = 'Must be a whole number'; break; }
                    $out[$name] = (int)$v; break;
                case $type === 'number':
                    if (!is_numeric($v) || (float)$v < 0 || (float)$v > 1e9) { $err[$name] = 'Must be a positive number'; break; }
                    $out[$name] = (float)$v; break;
                case $type === 'array':
                    if (!is_array($v) || count($v) > 100) { $err[$name] = 'Invalid list'; break; }
                    $out[$name] = array_values(array_filter(array_map(fn($x) => mb_substr(trim((string)$x), 0, 300), $v), fn($x) => $x !== '')); break;
                case $type === 'json':
                    if (!is_array($v) || strlen(json_encode($v)) > 50000) { $err[$name] = 'Invalid data'; break; }
                    $out[$name] = $v; break;
                case str_starts_with($type, 'enum:'):
                    $opts = explode('|', substr($type, 5));
                    if (!in_array($v, $opts, true)) { $err[$name] = 'Invalid choice'; break; }
                    $out[$name] = $v; break;
            }
        }
        return [$out, $err];
    }
}
