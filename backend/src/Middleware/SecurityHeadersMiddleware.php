<?php

namespace App\Middleware;

class SecurityHeadersMiddleware
{
 public static function handle(): void
 {
 $apiUrl = getenv('APP_API_URL') ?: "'self'";
 $frontendUrl = getenv('APP_FRONTEND_URL') ?: "'self'";
 header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' {$apiUrl} {$frontendUrl}");
 header('X-Frame-Options: DENY');
 header('X-Content-Type-Options: nosniff');
 header('Referrer-Policy: strict-origin-when-cross-origin');
 header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
 header('X-XSS-Protection: 1; mode=block');
 header('Cache-Control: no-store, no-cache, must-revalidate');
 header('Pragma: no-cache');
 }
}
