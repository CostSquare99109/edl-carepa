<?php

namespace App\Helper;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailHelper
{
	private static ?array $config = null;

	private static function loadConfig(): void
	{
		if (self::$config !== null) return;

		$envFile = dirname(__DIR__, 2) . '/.env';
		if (file_exists($envFile)) {
			$lines = @parse_ini_file($envFile);
			if ($lines === false) {
				// Fallback: parsear manualmente si parse_ini_file falla (caracteres especiales en valores)
				$lines = [];
				foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
					$line = trim($line);
					if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, ';')) continue;
					$eq = strpos($line, '=');
					if ($eq !== false) {
						$key = trim(substr($line, 0, $eq));
						$val = trim(substr($line, $eq + 1));
						$lines[$key] = $val;
					}
				}
			}
			self::$config = $lines;
			return;
		}

		self::$config = [];
	}

	private static function env(string $key, string $default = ''): string
	{
		self::loadConfig();
		return self::$config[$key] ?? $default;
	}

	public static function enviar(string $destinatario, string $nombreDest, string $asunto, string $cuerpoHTML, string $cuerpoTexto = ''): bool
	{
		$mail = new PHPMailer(true);

		try {
			// Configuración SMTP
			$mail->isSMTP();
			$mail->Host       = self::env('SMTP_HOST', 'smtp.gmail.com');
			$mail->Port       = (int) self::env('SMTP_PORT', '587');
			$mail->SMTPAuth   = true;
			$mail->Username   = self::env('SMTP_USER', 'jhonfredymontalvocuadrado1@gmail.com');
			$mail->Password   = self::env('SMTP_PASS', 'wwkvfjdbwjfqvlav');
			$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
			$mail->CharSet    = 'UTF-8';

			// Remitente
			$mail->setFrom(
				self::env('SMTP_FROM', self::env('SMTP_USER', 'jhonfredymontalvocuadrado1@gmail.com')),
				self::env('SMTP_FROM_NAME', 'EDL-CAREPA')
			);

			// Destinatario
			$mail->addAddress($destinatario, $nombreDest);

			// Contenido
			$mail->isHTML(true);
			$mail->Subject = $asunto;
			$mail->Body    = $cuerpoHTML;
			$mail->AltBody = $cuerpoTexto ?: strip_tags($cuerpoHTML);

			return $mail->send();
		} catch (Exception $e) {
			error_log('MailHelper Error: ' . $mail->ErrorInfo);
			return false;
		}
	}

	public static function enviarRecuperacion(string $emailDest, string $nombreDest, string $codigo): bool
	{
		$frontendUrl = self::env('FRONTEND_URL', 'http://localhost:5173');
		$link = $frontendUrl . '/verificar-codigo?email=' . urlencode($emailDest);

		$html = '
		<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
			<div style="background: #003366; padding: 24px 32px; text-align: center;">
				<h1 style="color: #ffffff; margin: 0; font-size: 22px;">EDL-CAREPA</h1>
				<p style="color: #b0c4de; margin: 4px 0 0; font-size: 14px;">Evaluación del Desempeño Laboral</p>
			</div>
			<div style="padding: 32px;">
				<p style="font-size: 16px; color: #333;">Hola <strong>' . htmlspecialchars($nombreDest) . '</strong>,</p>
				<p style="font-size: 15px; color: #555;">Recibimos una solicitud para restablecer su contraseña. Ingrese el siguiente código en la página de verificación:</p>
				<div style="background: #f5f7fa; border: 1px dashed #003366; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
					<span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #003366;">' . $codigo . '</span>
				</div>
				<div style="text-align: center; margin: 20px 0;">
					<a href="' . $link . '" style="background: #003366; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px; display: inline-block;">Verificar código</a>
				</div>
				<p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 16px;">Este código expira en 1 hora. Si no solicitó este cambio, ignore este correo.</p>
			</div>
			<div style="background: #f5f7fa; padding: 12px 32px; text-align: center;">
				<p style="font-size: 12px; color: #999; margin: 0;">Alcaldía de Carepa — Sistema EDL-CAREPA</p>
			</div>
		</div>';

		$texto = "Hola {$nombreDest},\n\nSu código de recuperación es: {$codigo}\n\nO visite: {$link}\n\nEste código expira en 1 hora.";

		return self::enviar($emailDest, $nombreDest, 'Código de recuperación — EDL-CAREPA', $html, $texto);
	}
}
