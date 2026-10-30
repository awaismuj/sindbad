<?php
declare(strict_types=1);
namespace App;

/**
 * Minimal SMTP client (no extra dependencies). Configure SMTP_* in server/.env.
 * If SMTP is not configured nothing is sent and nothing pretends to be sent.
 * Secrets stay in the environment; only the notification address and sender name live in Admin > Settings.
 */
final class Mailer {
    public static function configured(): bool { return (bool)(Env::get('SMTP_HOST') && Env::get('SMTP_FROM')); }

    private static function clean(string $s): string { return trim(preg_replace('/[\r\n]+/', ' ', $s)); }

    /** @return bool true when the server accepted the message */
    public static function send(string $to, string $subject, string $text, ?string $replyTo = null, ?string $fromName = null): bool {
        if (!self::configured() || !filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
        $host = (string)Env::get('SMTP_HOST'); $port = (int)Env::get('SMTP_PORT', '587');
        $secure = strtolower((string)Env::get('SMTP_SECURE', $port === 465 ? 'ssl' : 'tls')); // ssl | tls (STARTTLS) | none
        $from = (string)Env::get('SMTP_FROM'); $user = Env::get('SMTP_USER'); $pass = Env::get('SMTP_PASS');
        $fromName = self::clean($fromName ?: 'Sindbad Solution Website');
        try {
            $ctx = stream_context_create(['ssl' => ['verify_peer' => Env::get('SMTP_VERIFY_TLS', '1') !== '0', 'verify_peer_name' => Env::get('SMTP_VERIFY_TLS', '1') !== '0']]);
            $fp = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port", $en, $es, 8, STREAM_CLIENT_CONNECT, $ctx);
            if (!$fp) throw new \RuntimeException("SMTP connect failed: $es");
            stream_set_timeout($fp, 8);
            $read = function () use ($fp): array {
                $code = 0; $all = '';
                while (($line = fgets($fp, 1024)) !== false) { $all .= $line; $code = (int)substr($line, 0, 3); if (strlen($line) < 4 || $line[3] !== '-') break; }
                return [$code, $all];
            };
            $cmd = function (string $c, array $ok) use ($fp, $read): string {
                if ($c !== '') fwrite($fp, $c . "\r\n");
                [$code, $all] = $read();
                if (!in_array($code, $ok, true)) throw new \RuntimeException('SMTP error after ' . (str_starts_with($c, 'AUTH') || strlen($c) > 60 ? 'command' : $c) . ": $all");
                return $all;
            };
            $cmd('', [220]);
            $domain = parse_url((string)Env::get('APP_URL', 'https://localhost'), PHP_URL_HOST) ?: 'localhost';
            $cmd("EHLO $domain", [250]);
            if ($secure === 'tls') {
                $cmd('STARTTLS', [220]);
                if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new \RuntimeException('STARTTLS failed');
                $cmd("EHLO $domain", [250]);
            }
            if ($user !== null && $user !== '') {
                $cmd('AUTH LOGIN', [334]); $cmd(base64_encode($user), [334]); $cmd(base64_encode((string)$pass), [235]);
            }
            $cmd("MAIL FROM:<$from>", [250]);
            $cmd("RCPT TO:<$to>", [250, 251]);
            $cmd('DATA', [354]);
            $enc = fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
            $headers = [
                'Date: ' . date('r'), "From: {$enc($fromName)} <$from>", "To: <$to>", 'Subject: ' . $enc(self::clean($subject)),
                'Message-ID: <' . bin2hex(random_bytes(12)) . "@$domain>", 'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64',
            ];
            if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers[] = "Reply-To: <$replyTo>";
            $body = chunk_split(base64_encode($text), 76, "\r\n");
            fwrite($fp, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
            [$code, $all] = $read();
            if ($code !== 250) throw new \RuntimeException("SMTP rejected message: $all");
            @fwrite($fp, "QUIT\r\n"); fclose($fp);
            return true;
        } catch (\Throwable $e) {
            error_log('[mailer] ' . $e->getMessage());
            if (isset($fp) && is_resource($fp)) @fclose($fp);
            return false;
        }
    }

    /** Tell the site owner about a new enquiry, demo request or job application. Never throws. */
    public static function notify(string $kind, array $d): void {
        if (!self::configured()) return;
        $s = Db::col('settings')->findOne(['_id' => 'site']);
        $to = $s['notify_email'] ?? $s['email'] ?? null;
        if (!$to) return;
        $label = ['leads' => 'New enquiry', 'demos' => 'New demo request', 'applications' => 'New job application'][$kind] ?? 'New submission';
        $lines = [];
        foreach (['name', 'email', 'phone', 'company', 'industry', 'interest', 'subject', 'budget', 'locations', 'preferred_time', 'contact_method', 'resume_url', 'source_page'] as $k)
            if (!empty($d[$k])) $lines[] = ucfirst(str_replace('_', ' ', $k)) . ': ' . $d[$k];
        $lines[] = ''; $lines[] = (string)($d['requirements'] ?? '');
        $lines[] = ''; $lines[] = 'Manage it in the admin panel: ' . rtrim((string)Env::get('APP_URL', ''), '/') . '/admin/' . $kind;
        self::send((string)$to, $label . ': ' . ($d['name'] ?? ''), implode("\n", $lines), $d['email'] ?? null, $s['email_from_name'] ?? null);
    }
}
