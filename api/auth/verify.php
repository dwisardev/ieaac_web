<?php
/**
 * Verify Endpoint - Verificar token JWT
 * I.E. Andrés Avelino Cáceres
 * 
 * POST /api/auth/verify
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

require_once __DIR__ . '/../middleware/Auth.php';

try {
    // Verificar token
    $auth = Auth::verify();
    
    if (!$auth['success']) {
        http_response_code(401);
        echo json_encode($auth);
        exit();
    }
    
    // Token válido
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Token válido',
        'data' => $auth['data']
    ]);
    
} catch (Exception $e) {
    error_log("Error en verify: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => 'Ocurrió un error al verificar el token'
    ]);
}