<?php
declare(strict_types=1);

namespace App\Helper;

use App\Config\Env;
use App\Helper\ResponseHelper;

class UploadHelper
{
	private static array $allowedMimesCache = [];
	private static int $maxSizeBytesCache = 0;

	private static function getAllowedMimes(): array
	{
		if (self::$allowedMimesCache) {
			return self::$allowedMimesCache;
		}

		$csv = Env::get('UPLOAD_MIMES_PERMITIDOS', '');
		if ($csv) {
			$extensions = array_map('trim', explode(',', $csv));
			$fullMap = [
				'pdf'  => 'application/pdf',
				'jpg'  => 'image/jpeg',
				'jpeg' => 'image/jpeg',
				'png'  => 'image/png',
				'doc'  => 'application/msword',
				'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'xls'  => 'application/vnd.ms-excel',
				'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			];
			self::$allowedMimesCache = array_intersect_key($fullMap, array_flip($extensions));
			return self::$allowedMimesCache;
		}

		// Default completo si no se define en .env
		self::$allowedMimesCache = [
			'pdf'  => 'application/pdf',
			'jpg'  => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'png'  => 'image/png',
			'doc'  => 'application/msword',
			'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'xls'  => 'application/vnd.ms-excel',
			'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		];
		return self::$allowedMimesCache;
	}

	private static function getMaxSizeBytes(): int
	{
		if (self::$maxSizeBytesCache) {
			return self::$maxSizeBytesCache;
		}
		$maxMB = (int) Env::get('UPLOAD_TAMANO_MAXIMO_MB', '10');
		self::$maxSizeBytesCache = $maxMB * 1048576;
		return self::$maxSizeBytesCache;
	}

	public static function validar(array $file): array
	{
		if (empty($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
			ResponseHelper::error('Error al subir archivo', 422);
		}

		if ($file['size'] > self::getMaxSizeBytes()) {
			$maxMB = self::getMaxSizeBytes() / 1048576;
			ResponseHelper::error("El archivo excede el tamaño máximo de {$maxMB}MB", 422);
		}

		$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
		$allowedMimes = self::getAllowedMimes();

		if (!isset($allowedMimes[$extension])) {
			$permitidas = implode(', ', array_keys($allowedMimes));
			ResponseHelper::error("Tipo de archivo no permitido. Extensiones válidas: {$permitidas}", 422);
		}

  $mimeType = mime_content_type($file['tmp_name']);

  $expectedMime = $allowedMimes[$extension];
  if (!self::mimeTypeCompatible($mimeType, $expectedMime)) {
  ResponseHelper::error('El tipo MIME del archivo no coincide con su extension. Detectado: ' . ($mimeType ?: 'desconocido') . ', esperado: ' . $expectedMime, 422);
  }

		return [
			'extension'     => $extension,
			'mime_type'     => $mimeType,
			'size'          => $file['size'],
			'tmp_name'      => $file['tmp_name'],
			'original_name' => $file['name'],
		];
	}

	public static function guardar(array $file, string $subdirectorio = ''): string
	{
		if (empty($file['tmp_name']) || empty($file['name'])) {
			ResponseHelper::error('Archivo invalido', 422);
		}

		$uploadDir = Env::get('UPLOAD_DIR', EDL_ROOT . '/uploads');
		if ($subdirectorio) {
			$uploadDir .= '/' . trim($subdirectorio, '/');
		}

		if (!is_dir($uploadDir)) {
			mkdir($uploadDir, 0755, true);
		}

		$hash = hash('sha256', $file['name'] . microtime(true) . random_bytes(16));
		$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
		$nombreSeguro = substr($hash, 0, 32) . '.' . $extension;
		$rutaCompleta = $uploadDir . '/' . $nombreSeguro;

		if (!move_uploaded_file($file['tmp_name'], $rutaCompleta)) {
			$lastError = error_get_last();
			$msg = $lastError ? $lastError['message'] : 'desconocido';
			ResponseHelper::error('Error al guardar archivo: ' . $msg . ' (origen=' . $file['tmp_name'] . ', destino=' . $rutaCompleta . ')', 500);
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
			'application/pdf' => ['application/pdf'],
		];

		return isset($compatibles[$expected]) && in_array($detected, $compatibles[$expected]);
	}
}