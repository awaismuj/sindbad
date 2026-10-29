<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\{Auth, Env, Http, Router};

Env::load(__DIR__ . '/../.env');
mb_internal_encoding('UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');
ini_set('display_errors', '0');

set_exception_handler(function (\Throwable $e) {
    error_log((string)$e);
    Http::error('Something went wrong on our side. Please try again.', 500);
});

$router = new Router();
(require __DIR__ . '/../src/routes.php')($router);
Auth::csrf();
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
