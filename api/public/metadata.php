<?php
/**
 * /api/metadata — metadatos del Proyecto FONDEP
 * GET /api/metadata         → todos los metadatos como objeto clave:valor
 * GET /api/metadata?clave=X → valor de una clave específica
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = (new Database())->getConnection();

    if (!empty($_GET['clave'])) {
        $clave = trim($_GET['clave']);
        $stmt  = $db->prepare("SELECT clave, valor, tipo FROM proyecto_fondep_metadata WHERE clave = :c LIMIT 1");
        $stmt->execute([':c' => $clave]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $row ?: null], JSON_UNESCAPED_UNICODE);
    } else {
        $stmt = $db->query("SELECT clave, valor, tipo, descripcion FROM proyecto_fondep_metadata ORDER BY clave");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convertir array a objeto clave→valor para facilidad de uso
        $data = [];
        foreach ($rows as $r) {
            $data[$r['clave']] = [
                'valor'      => $r['valor'],
                'tipo'       => $r['tipo'],
                'descripcion'=> $r['descripcion'],
            ];
        }
        echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    error_log('[API metadata] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor']);
}
