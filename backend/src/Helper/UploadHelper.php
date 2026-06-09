<?php

namespace App\Helper;

use App\Config\Env;
use App\Helper\ResponseHelper;

class UploadHelper
{
 private static array $allowedMimes = [
 'pdf' => 'application/pdf',
 'jpg' => 'image/jpeg',
 'jpeg' => 'image/jpeg',
 'png' => 'image/png',
 'doc' => 'application/msword',
 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'xls' => 'application/vnd.ms-excel',
 'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
 ];

 private static int $maxSizeBytes = 10485760;

 public static function validar(array $file): array
 {
 if (empty($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
 ResponseHelper::error('Error al subir archivo', 422);
 }

 if ($file['size'] > self::$maxSizeBytes) {
 $maxMB = self::$maxSizeBytes / 1048576;
 ResponseHelper::error("El archivo excede el tamaño maximo de {$maxMB}MB", 422);
 }

 $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
 if (!isset(self::$allowedMimes[$extension])) {
 $permitidas = implode(', ', array_keys(self::$allowedMimes));
 ResponseHelper::error("Tipo de archivo no permitido. Extensiones validas: {$permitidas}", 422);
 }

 $finfo = finfo_open(FILEINFO_MIME_TYPE);
 $mimeType = finfo_file($finfo, $file['tmp_name']);
 finfo_close($finfo);

 $expectedMime = self::$allowedMimes[$extension];
 if ($mimeType !== $expectedMime && !self::mimeTypeCompatible($mimeType, $expectedMime)) {
 ResponseHelper::error('El tipo MIME del archivo no coincide con su extension', 422);
 }

 return [
 'extension' => $extension,
 'mime_type' => $mimeType,
 'size' => $file['size'],
 'tmp_name' => $file['tmp_name'],
 'original_name' => $file['name']
 ];
 }

 public static function guardar(array $file, string $subdirectorio = ''): string
 {
 $validado = self::validar($file);

 $uploadDir = Env::get('UPLOAD_DIR', EDL_ROOT . '/uploads');
 if ($subdirectorio) {
 $uploadDir .= '/' . trim($subdirectorio, '/');
 }

 if (!is_dir($uploadDir)) {
 mkdir($uploadDir, 0755, true);
 }

 $hash = hash('sha256', $validado['original_name'] . microtime(true) . random_bytes(16));
 $nombreSeguro = substr($hash, 0, 32) . '.' . $validado['extension'];
 $rutaCompleta = $uploadDir . '/' . $nombreSeguro;

 if (!move_uploaded_file($validado['tmp_name'], $rutaCompleta)) {
 ResponseHelper::error('Error al guardar archivo', 500);
 }

 $rutaRelativa = ($subdirectorio ? trim($subdirectorio, '/') . '/' : '') . $nombreSeguro;
 return $rutaRelativa;
 }

 private static function mimeTypeCompatible(string $detected, string $expected): bool
 {
 $compatibles = [
 'application/vnd.ms-excel' => ['application/vnd.ms-excel', 'application/octet-stream'],
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
 'image/jpeg' => ['image/jpeg'],
 'image/png' => ['image/png'],
 'application/pdf' => ['application/pdf']
 ];

 return isset($compatibles[$expected]) && in_array($detected, $compatibles[$expected]);
 }
}
