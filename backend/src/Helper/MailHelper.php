<?php

namespace App\Helper;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Config\Env;

class MailHelper
{
	public static function enviar(string $destinatario, string $nombreDest, string $asunto, string $cuerpoHTML, string $cuerpoTexto = ''): bool
	{
		$mail = new PHPMailer(true);

		try {
			$mail->isSMTP();
			$mail->Host = Env::require('MAIL_HOST');
			$mail->Port = (int) Env::require('MAIL_PORT');
			$mail->SMTPAuth = true;
			$mail->Username = Env::require('MAIL_USER');
			$mail->Password = Env::require('MAIL_PASS');
			$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
			$mail->CharSet = 'UTF-8';

			$fromEmail = Env::get('MAIL_FROM', '') ?: Env::get('MAIL_USER', '');
			if (empty($fromEmail) || empty($mail->Username) || empty($mail->Password)) {
				error_log('MailHelper: Credenciales SMTP no configuradas. Defina MAIL_USER y MAIL_PASS en .env');
				return false;
			}

			$mail->setFrom(
				$fromEmail,
				Env::get('MAIL_FROM_NAME', 'EDL-CAREPA')
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

	public static function enviarCodigoVerificacion(string $destinatario, string $nombreDest, string $codigo): bool
	{
		$asunto = 'Código de verificación - EDL-CAREPA';
		$cuerpoHTML = "
		<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
			<div style=\"background-color: #0A2B5E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;\">
				<h1 style=\"margin: 0; font-size: 24px;\">EDL-CAREPA</h1>
				<p style=\"margin: 5px 0 0; font-size: 14px;\">Sistema de Evaluación del Desempeño Laboral</p>
			</div>
			<div style=\"background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;\">
				<h2 style=\"color: #0A2B5E; margin-top: 0;\">Código de verificación</h2>
				<p>Hola <strong>{$nombreDest}</strong>,</p>
				<p>Tu código de verificación es:</p>
				<div style=\"background-color: white; border: 2px solid #0A2B5E; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;\">
					<span style=\"font-size: 32px; font-weight: bold; color: #0A2B5E; letter-spacing: 4px;\">{$codigo}</span>
				</div>
				<p style=\"font-size: 13px; color: #666;\">Este código expira en 1 hora. Si no solicitó este cambio, ignore este correo.</p>
			</div>
			<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 20px;\">Alcaldía de Carepa — Sistema EDL-CAREPA</p>
		</div>
		";
		$cuerpoTexto = "Tu código de verificación EDL-CAREPA es: {$codigo}. Expira en 1 hora.";

		return self::enviar($destinatario, $nombreDest, $asunto, $cuerpoHTML, $cuerpoTexto);
	}

	public static function enviarNuevaContrasena(string $destinatario, string $nombreDest, string $contrasenaTemporal): bool
	{
		$asunto = 'Nueva contraseña temporal - EDL-CAREPA';
		$cuerpoHTML = "
		<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
			<div style=\"background-color: #0A2B5E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;\">
				<h1 style=\"margin: 0; font-size: 24px;\">EDL-CAREPA</h1>
				<p style=\"margin: 5px 0 0; font-size: 14px;\">Sistema de Evaluación del Desempeño Laboral</p>
			</div>
			<div style=\"background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;\">
				<h2 style=\"color: #0A2B5E; margin-top: 0;\">Nueva contraseña temporal</h2>
				<p>Hola <strong>{$nombreDest}</strong>,</p>
				<p>Se ha generado una nueva contraseña temporal para tu cuenta:</p>
				<div style=\"background-color: white; border: 2px solid #F9B233; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;\">
					<span style=\"font-size: 24px; font-weight: bold; color: #0A2B5E; font-family: monospace;\">{$contrasenaTemporal}</span>
				</div>
				<p style=\"color: #DC2626; font-weight: bold;\">Por seguridad, debes cambiar esta contraseña al iniciar sesión por primera vez.</p>
				<p style=\"font-size: 13px; color: #666;\">Si no solicitó este cambio, contacte al administrador del sistema.</p>
			</div>
			<p style=\"font-size: 12px; color: #999; text-align: center; margin-top: 20px;\">Alcaldía de Carepa — Sistema EDL-CAREPA</p>
		</div>
		";
		$cuerpoTexto = "Tu nueva contraseña temporal EDL-CAREPA es: {$contrasenaTemporal}. Debes cambiarla al iniciar sesión.";

		return self::enviar($destinatario, $nombreDest, $asunto, $cuerpoHTML, $cuerpoTexto);
	}
}