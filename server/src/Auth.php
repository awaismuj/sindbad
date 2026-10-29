<?php
declare(strict_types=1);
namespace App;

final class Auth {
    public const ROLES = ['super_admin', 'content_manager', 'sales_manager'];

    public static function start(): void {
        if (session_status() === PHP_SESSION_ACTIVE) return;
        session_name(Env::get('SESSION_NAME', 'sindbad_sid'));
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/',
            'secure' => Env::get('APP_ENV') === 'production',
            'httponly' => true, 'samesite' => 'Strict',
        ]);
        session_start();
    }
    /** CSRF defence: state-changing calls must carry a custom header (forces a CORS preflight; SameSite=Strict covers the rest). */
    public static function csrf(): void {
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH', 'DELETE'], true)
            && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'sindbad') {
            Http::error('Invalid request', 403);
        }
    }
    public static function user(): ?array {
        self::start();
        $id = $_SESSION['uid'] ?? null;
        if (!$id || !($oid = Db::oid($id))) return null;
        $u = Db::col('users')->findOne(['_id' => $oid, 'active' => true]);
        return $u ? Db::ser($u) : null;
    }
    /** Server-side permission check. Pass allowed roles; super_admin is always allowed. */
    public static function require(array $roles = []): array {
        $u = self::user();
        if (!$u) Http::error('Authentication required', 401);
        if ($roles && $u['role'] !== 'super_admin' && !in_array($u['role'], $roles, true)) Http::error('Forbidden', 403);
        return $u;
    }
    public static function login(string $email, string $password): ?array {
        $u = Db::col('users')->findOne(['email' => strtolower(trim($email)), 'active' => true]);
        // Always run a hash check to keep timing similar for unknown emails
        $hash = $u['password_hash'] ?? password_hash('x', PASSWORD_DEFAULT);
        if (!password_verify($password, $hash) || !$u) return null;
        self::start();
        session_regenerate_id(true);
        $_SESSION['uid'] = (string)$u['_id'];
        return Db::ser($u);
    }
    public static function logout(): void {
        self::start();
        $_SESSION = [];
        session_destroy();
    }
}
