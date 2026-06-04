<?php

namespace App\Helper;

class SanitizerHelper
{
    public static function sanitize(mixed $value): mixed
    {
    if (is_array($value)) {
    return array_map([self::class, 'sanitize'], $value);
    }

    if (is_string($value)) {
    $value = trim($value);
    $value = stripslashes($value);
    return $value;
    }

    return $value;
    }

    public static function sanitizeArray(array $data): array
    {
        $clean = [];
        foreach ($data as $key => $value) {
            $clean[$key] = self::sanitize($value);
        }
        return $clean;
    }

    public static function cleanInt(mixed $value): int
    {
        return (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    public static function cleanEmail(string $value): string
    {
        return filter_var(trim($value), FILTER_SANITIZE_EMAIL);
    }

    public static function cleanString(mixed $value): string
    {
    if (!is_string($value)) {
    return '';
    }
    return trim(strip_tags($value));
    }

    public static function escapeOutput(mixed $value): string
    {
    if (!is_string($value)) {
    return '';
    }
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    }
