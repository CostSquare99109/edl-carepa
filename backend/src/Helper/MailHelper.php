<?php

namespace App\Helper;

use App\Config\Env;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailHelper
{
	public static function enviar(string $destinatario, string $nombreDest, string $asunto, string $cuerpoHTML, string $cuerpoTexto = ''): bool
	{
		$mail = new PHPMailer(true);

		try {
			$mail->isSMTP();
			$mail->Host = Env::get('SMTP_HOST', 'smtp.gmail.com');
			$mail->Port = (int) Env::get('SMTP_PORT', '587');
			$mail->SMTPAuth = true;
			$mail->Username = Env::get('SMTP_USER', '');
			$mail->Password = Env::get('SMTP_PASS', '');
			$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
			$mail->CharSet = 'UTF-8';

			$fromEmail = Env::get('SMTP_FROM', '') ?: Env::get('SMTP_USER', '');
			if (empty($fromEmail) || empty($mail->Username) || empty($mail->Password)) {
				error_log('MailHelper: Credenciales SMTP no configuradas. Defina SMTP_USER y SMTP_PASS en .env');
				return false;
			}

			$mail->setFrom(
				$fromEmail,
				Env::get('SMTP_FROM_NAME', 'EDL-CAREPA')
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
		$frontendUrl = Env::get('FRONTEND_URL', 'http://localhost:5173');
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
