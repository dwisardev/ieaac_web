<?php
/**
 * Refresh Endpoint - Renovar access token
 * I.E. Andrés Avelino Cáceres
 * 
 * POST /api/auth/refresh
 * Body: { "refresh_token": "..." }
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

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/Auth.php';

try {
    // Obtener datos del body
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Datos inválidos',
            'message' => 'El formato de datos es incorrecto'
        ]);
        exit();
    }
    
    $refreshToken = $data['refresh_token'] ?? '';
    
    if (empty($refreshToken)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Refresh token requerido',
            'message' => 'Debe proporcionar el refresh token'
        ]);
        exit();
    }
    
    // Verificar refresh token
    $userId = Auth::verifyRefreshToken($refreshToken);
    
    if (!$userId) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Refresh token inválido o expirado',
            'message' => 'Debe iniciar sesión nuevamente'
        ]);
        exit();
    }
    
    // Obtener datos del usuario
    $database = new Database();
    $db = $database->getConnection();
    
    $user = new User($db);
    $userData = $user->findById($userId);
    
    if (!$userData) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Usuario no encontrado',
            'message' => 'El usuario ya no existe'
        ]);
        exit();
    }
    
    // Verificar si el usuario está activo
    if (!$user->isActive()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Usuario inactivo',
            'message' => 'Tu cuenta ha sido desactivada'
        ]);
        exit();
    }
    
    // Generar nuevo access token
    $newAccessToken = Security::generateJWT(
        $userData['id'],
        $userData['username'],
        $userData['rol'],
        [
            'email' => $userData['email']
        ]
    );
    
    // Opcionalmente, generar nuevo refresh token (rotación)
    $rotateRefreshToken = $data['rotate'] ?? false;
    
    if ($rotateRefreshToken) {
        // Revocar el refresh token anterior
        Auth::revokeRefreshToken($refreshToken);
        
        // Generar nuevo refresh token
        $newRefreshTokenData = Security::generateRefreshToken($userData['id']);
        
        // Guardar en BD
        $expiresAt = date('Y-m-d H:i:s', $newRefreshTokenData['expires_at']);
        Auth::saveRefreshToken(
            $userData['id'],
            $newRefreshTokenData['token'],
            $expiresAt
        );
        
        $refreshTokenToReturn = $newRefreshTokenData['token'];
    } else {
        $refreshTokenToReturn = $refreshToken;
    }
    
    // Log de seguridad
    Security::logSecurityEvent('token_refreshed', [
        'user_id' => $userData['id'],
        'username' => $userData['username'],
        'rotated' => $rotateRefreshToken
    ]);
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Token renovado correctamente',
        'data' => [
            'access_token' => $newAccessToken,
            'refresh_token' => $refreshTokenToReturn,
            'token_type' => 'Bearer',
            'expires_in' => (int)($_ENV['JWT_EXPIRATION'] ?? 3600)
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("Error en refresh: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => 'Ocurrió un error al renovar el token'
    ]);
}