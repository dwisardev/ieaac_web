<?php
/**
 * Init Security - Validación de configuración de seguridad al arrancar
 * Este archivo debe ser incluido al principio de la API
 */

require_once __DIR__ . '/config/Security.php';

try {
    // Validar configuración de JWT_SECRET (warning si es débil, no error fatal)
    $jwtSecret = $_ENV['JWT_SECRET'] ?? '';

    if (empty($jwtSecret)) {
        error_log('[SECURITY_WARNING] JWT_SECRET no está configurado. Por favor, configúralo en .env');
        // NO bloqueamos - solo advertencia
    } elseif ($jwtSecret === 'secret_key_change_me') {
        error_log('[SECURITY_WARNING] JWT_SECRET está usando valor por defecto. Cambia a un valor seguro en .env');
        // NO bloqueamos - solo advertencia
    } elseif (strlen($jwtSecret) < 32) {
        error_log('[SECURITY_WARNING] JWT_SECRET es muy corto (' . strlen($jwtSecret) . ' chars). Usa mínimo 32.');
        // NO bloqueamos - solo advertencia
    }

    // Log de inicio
    error_log('[API_INIT] API inicializada correctamente');

} catch (Exception $e) {
    // Error no esperado - solo log
    error_log('[INIT_ERROR] ' . $e->getMessage());
}

