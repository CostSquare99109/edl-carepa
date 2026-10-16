<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($uri, '/api/')) {
    $backend = 'http://localhost:8000' . $uri;
    if (($q = $_SERVER['QUERY_STRING'] ?? '')) $backend .= '?' . $q;
    $ch = curl_init($backend);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
        CURLOPT_POSTFIELDS => file_get_contents('php://input'),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    http_response_code($code);
    echo $resp;
    return true;
}
return false;
