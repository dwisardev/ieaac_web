<?php
/**
 * Test de conexión a base de datos
 * ⚠️ ELIMINAR ESTE ARCHIVO EN PRODUCCIÓN ⚠️
 * 
 * Este archivo solo debe usarse durante desarrollo
 * Nunca subir a servidor de producción
 */

// Verificar que estamos en modo desarrollo
if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production') {
    http_response_code(403);
    die('Este archivo no está disponible en producción');
}

// Headers de seguridad
header('Content-Type: application/json; charset=UTF-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// CORS solo para desarrollo local
$allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:8000');
}

header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/Database.php';

// Función para formatear bytes
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// Función para test de rendimiento
function testQueryPerformance($database) {
    $startTime = microtime(true);
    
    try {
        $stmt = $database->prepare("SELECT COUNT(*) as total FROM usuarios");
        $stmt->execute();
        $stmt->fetch();
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // Convertir a milisegundos
        
        return [
            'success' => true,
            'execution_time_ms' => round($executionTime, 2),
            'status' => $executionTime < 100 ? 'Excelente' : ($executionTime < 500 ? 'Bueno' : 'Lento')
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'No se pudo ejecutar la consulta'
        ];
    }
}

try {
    $startTime = microtime(true);
    
    // Crear instancia de Database
    $database = new Database();
    
    // Intentar conexión
    $conn = $database->getConnection();
    
    if (!$database->isConnected()) {
        throw new Exception('No se pudo establecer conexión');
    }
    
    // Obtener información de la BD
    $dbInfo = $database->getInfo();
    
    // Test de queries en múltiples tablas
    $tablesTest = [];
    $tables = [
        'usuarios' => 'Usuarios del sistema',
        'noticias' => 'Noticias publicadas',
        'logros' => 'Logros institucionales',
        'eventos' => 'Eventos programados',
        'comunicados' => 'Comunicados oficiales'
    ];
    
    foreach ($tables as $table => $description) {
        try {
            $query = "SELECT COUNT(*) as total FROM {$table}";
            $stmt = $database->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch();
            
            $tablesTest[$table] = [
                'description' => $description,
                'total' => (int)$result['total'],
                'status' => 'OK'
            ];
        } catch (Exception $e) {
            $tablesTest[$table] = [
                'description' => $description,
                'total' => 0,
                'status' => 'ERROR',
                'error' => 'No se pudo acceder a esta tabla'
            ];
        }
    }
    
    // Test de rendimiento
    $performanceTest = testQueryPerformance($database);
    
    // Obtener información del servidor PHP
    $phpInfo = [
        'version' => PHP_VERSION,
        'os' => PHP_OS,
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time') . 's',
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'extensions' => [
            'pdo' => extension_loaded('pdo'),
            'pdo_mysql' => extension_loaded('pdo_mysql'),
            'mbstring' => extension_loaded('mbstring'),
            'json' => extension_loaded('json'),
            'openssl' => extension_loaded('openssl'),
            'fileinfo' => extension_loaded('fileinfo')
        ]
    ];
    
    // Verificar extensiones críticas
    $missingExtensions = [];
    foreach ($phpInfo['extensions'] as $ext => $loaded) {
        if (!$loaded) {
            $missingExtensions[] = $ext;
        }
    }
    
    // Calcular tiempo total
    $endTime = microtime(true);
    $totalTime = ($endTime - $startTime) * 1000;
    
    // Respuesta exitosa
    $response = [
        'success' => true,
        'message' => '✓ Conexión exitosa a la base de datos',
        'timestamp' => date('Y-m-d H:i:s'),
        'execution_time_ms' => round($totalTime, 2),
        
        'database' => [
            'info' => $dbInfo,
            'connection_status' => 'Conectado',
            'charset' => 'utf8mb4'
        ],
        
        'tables_test' => $tablesTest,
        
        'performance' => $performanceTest,
        
        'php' => $phpInfo,
        
        'security_checks' => [
            'env_file' => file_exists(__DIR__ . '/../.env') ? 'Encontrado' : 'No encontrado',
            'htaccess' => file_exists(__DIR__ . '/../.htaccess') ? 'Configurado' : 'No configurado',
            'logs_directory' => is_dir(__DIR__ . '/logs') ? 'Existe' : 'No existe',
            'uploads_directory' => is_dir(__DIR__ . '/../uploads') ? 'Existe' : 'No existe'
        ],
        
        'warnings' => []
    ];
    
    // Agregar advertencias si existen
    if (!empty($missingExtensions)) {
        $response['warnings'][] = 'Extensiones PHP faltantes: ' . implode(', ', $missingExtensions);
    }
    
    if (!file_exists(__DIR__ . '/../.htaccess')) {
        $response['warnings'][] = 'Archivo .htaccess no encontrado - Configurar seguridad';
    }
    
    if (!is_dir(__DIR__ . '/logs')) {
        $response['warnings'][] = 'Directorio de logs no existe';
    }
    
    // Cerrar conexión
    $database->closeConnection();
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);

    error_log('[TEST_DATABASE] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());

    $errorResponse = [
        'success' => false,
        'message' => '✗ Error en la conexión',
        'error' => 'No se pudo conectar a la base de datos',
        'timestamp' => date('Y-m-d H:i:s'),

        'suggestions' => [
            '1. Verificar credenciales en archivo .env',
            '2. Verificar que MySQL esté corriendo',
            '3. Verificar que la base de datos exista',
            '4. Verificar permisos del usuario de BD',
            '5. Revisar logs de error de PHP'
        ]
    ];

    echo json_encode($errorResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}