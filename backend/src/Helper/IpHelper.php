<?php

namespace App\Helper;

class IpHelper
{
 public static function clientIp(): string
 {
 $headers = [
 'HTTP_X_FORWARDED_FOR',
 'HTTP_X_REAL_IP',
 'HTTP_CF_CONNECTING_IP',
 'HTTP_TRUE_CLIENT_IP',
 ];

 foreach ($headers as $header) {
 $value = $_SERVER[$header] ?? '';
 if ($value !== '') {
 $ips = array_map('trim', explode(',', $value));
 foreach ($ips as $ip) {
 if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
 return $ip;
 }
 }
 }
 }

 return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
 }
}
