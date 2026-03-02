<?php
/**
 * Middleware RateLimit - Control de tasa de peticiones
 * I.E. Andrés Avelino Cáceres
 *
 * Delega en Security::checkRateLimit() (implementación en BD, tabla rate_limits).
 *
 * Uso rápido:
 *   RateLimit::enforce($_SERVER['REMOTE_ADDR']);  // bloquea y sale si excede
 *
 * Uso manual:
 *   if (!RateLimit::check($identifier)) {
 *       RateLimit::tooManyRequests();
 *   }
 */

require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../config/Database.php';

class RateLimit
{
    /**
     * Verificar si el identificador puede continuar.
     * Retorna true si está permitido, false si debe bloquearse.
     *
     * @param string   $identifier  IP, username, o combinación
     * @param int|null $maxAttempts Intentos máximos (usa MAX_LOGIN_ATTEMPTS del .env si null)
     * @param int|null $timeWindow  Ventana en segundos (usa LOCKOUT_TIME del .env si null)
     */
    public static function check(string $identifier, ?int $maxAttempts = null, ?int $timeWindow = null): bool
    {
        return Security::checkRateLimit($identifier, $maxAttempts, $timeWindow);
    }

    /**
     * Resetear el contador de intentos para un identificador.
     */
    public static function reset(string $identifier): bool
    {
        return Security::resetRateLimit($identifier);
    }

    /**
     * Verificar y cortar la ejecución automáticamente si se excede el límite.
     * Envía respuesta 429 y hace exit().
     */
    public static function enforce(
        string $identifier,
        ?int $maxAttempts = null,
        ?int $timeWindow  = null,
        string $message   = 'Demasiadas solicitudes. Intenta más tarde.'
    ): void {
        if (!self::check($identifier, $maxAttempts, $timeWindow)) {
            self::tooManyRequests($message);
        }
    }

    /**
     * Enviar respuesta 429 Too Many Requests y salir.
     */
    public static function tooManyRequests(string $message = 'Demasiadas solicitudes. Intenta más tarde.'): void
    {
        http_response_code(429);
        header('Retry-After: ' . (int)($_ENV['LOCKOUT_TIME'] ?? 900));
        echo json_encode([
            'success' => false,
            'error'   => 'Too Many Requests',
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
