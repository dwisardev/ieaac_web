<?php
/**
 * /api/informacion — información institucional pública
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db   = (new Database())->getConnection();
    $stmt = $db->prepare("
        SELECT id, nombre, codigo_modular, director, ubicacion, telefono, email,
               anio_vigencia, grados_atendidos, nivel_educativo, tipo_gestion
        FROM   informacion_institucional
        WHERE  activo = 1
        LIMIT  1
    ");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $row ?: null], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[API informacion] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor']);
}
