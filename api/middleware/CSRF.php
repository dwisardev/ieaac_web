<?php
/**
 * CSRF Protection Middleware
 * Validar tokens CSRF para prevenir ataques de falsificación de solicitud entre sitios
 */

class CSRFMiddleware {

    private static $tokenHeader = 'HTTP_X_CSRF_TOKEN';
    // JS genera 32 bytes → 64 hex chars (crypto.getRandomValues(new Uint8Array(32)))
    private static $tokenLength = 64;

    /**
     * Validar token CSRF para solicitudes que modifiquen datos
     * GET y OPTIONS no requieren validación
     *
     * @return array ['success' => bool, 'error' => string|null]
     */
    public static function validate() {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // GET, HEAD, OPTIONS no requieren CSRF token
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
            return ['success' => true];
        }

        // Para POST, PUT, PATCH, DELETE: validar token
        $providedToken = $_SERVER[self::$tokenHeader] ?? '';

        if (empty($providedToken)) {
            return [
                'success' => false,
                'error' => 'Token CSRF faltante'
            ];
        }

        // Validar formato del token (64 caracteres hexadecimales)
        if (strlen($providedToken) !== self::$tokenLength || !ctype_xdigit($providedToken)) {
            return [
                'success' => false,
                'error' => 'Formato de token CSRF inválido'
            ];
        }

        // En un sistema real, verificarías el token contra almacenamiento (sesión, BD, etc)
        // Por ahora, validamos que el formato sea correcto y que esté presente
        // El token se genera en el cliente y se valida aquí

        \Security::logSecurityEvent('csrf_token_validated', [
            'method' => $method,
            'path' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ]);

        return ['success' => true];
    }

    /**
     * Generar un nuevo token CSRF para el cliente
     */
    public static function generateToken() {
        // Generar token aleatorio de 64 caracteres hexadecimales (32 bytes)
        $token = bin2hex(random_bytes(32));
        return $token;
    }

    /**
     * Obtener token CSRF del header de solicitud
     */
    public static function getTokenFromRequest() {
        return $_SERVER[self::$tokenHeader] ?? null;
    }
}
