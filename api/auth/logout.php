<?php
/**
 * Logout Endpoint - Cerrar sesión
 * I.E. Andrés Avelino Cáceres
 * 
 * POST /api/auth/logout
 * Header: Authorization: Bearer TOKEN
 */

header('Content-Type: application/json; charset=utf-8');

// Solo método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido',
        'message' => 'Use POST para este endpoint'
    ]);
    exit();
}

require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../middleware/Auth.php';

try {
    // Verificar autenticación
    $auth = Auth::verify();
    
    if (!$auth['success']) {
        http_response_code(401);
        echo json_encode($auth);
        exit();
    }
    
    $userId = $auth['data']['userId'];
    
    // Obtener token del header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    $token = trim($token);
    
    // Agregar token a blacklist
    Auth::blacklistToken($token, $userId, 'logout');
    
    // Obtener refresh token del body (opcional)
    $data = json_decode(file_get_contents("php://input"), true);
    $refreshToken = $data['refresh_token'] ?? null;
    
    if ($refreshToken) {
        Auth::revokeRefreshToken($refreshToken);
    }
    
    // Log de seguridad
    Security::logSecurityEvent('logout_success', [
        'user_id' => $userId,
        'username' => $auth['data']['username']
    ]);
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada correctamente'
    ]);
    
} catch (Exception $e) {
    error_log("Error en logout: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => 'Ocurrió un error al cerrar sesión'
    ]);
}