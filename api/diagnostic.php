<?php
/**
 * DIAGNOSTIC SCRIPT - Valida que todo esté configurado correctamente
 *
 * Accesso: https://tu-dominio.com/api/diagnostic.php
 *
 * ⚠️ ELIMINA ESTE ARCHIVO EN PRODUCCIÓN
 */

header('Content-Type: application/json; charset=utf-8');

$diagnostics = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => 'checking',
    'errors' => [],
    'warnings' => [],
    'info' => []
];

// 1. Verificar .env
try {
    $envFile = __DIR__ . '/../.env';
    if (!file_exists($envFile)) {
        $diagnostics['errors'][] = '.env no encontrado en ' . dirname($envFile);
    } else {
        $envContent = file_get_contents($envFile);

        // Verificar variables críticas
        if (strpos($envContent, 'JWT_SECRET=') === false) {
            $diagnostics['errors'][] = 'JWT_SECRET no está en .env';
        } else if (strpos($envContent, 'JWT_SECRET=secret_key_change_me') !== false) {
            $diagnostics['warnings'][] = 'JWT_SECRET está usando valor por defecto (secret_key_change_me)';
        }

        if (strpos($envContent, 'DB_USER=') === false) {
            $diagnostics['errors'][] = 'DB_USER no está en .env';
        }

        if (strpos($envContent, 'DB_PASS=') === false) {
            $diagnostics['errors'][] = 'DB_PASS no está en .env';
        }
    }
} catch (Exception $e) {
    $diagnostics['errors'][] = 'Error al leer .env: ' . $e->getMessage();
}

// 2. Verificar directorios
try {
    require_once __DIR__ . '/config/Database.php';
    $db = (new Database())->getConnection();
    $diagnostics['info'][] = '✅ Conexión a BD exitosa';

    // Verificar si existe tabla rate_limits
    $result = $db->query("SHOW TABLES LIKE 'rate_limits'");
    if ($result->rowCount() === 0) {
        $diagnostics['warnings'][] = 'Tabla rate_limits no existe. Ejecuta: api/migrations/001_create_rate_limits_table.sql';
    } else {
        $diagnostics['info'][] = '✅ Tabla rate_limits existe';

        // Count de registros
        $count = $db->query("SELECT COUNT(*) as total FROM rate_limits")->fetch()['total'];
        $diagnostics['info'][] = "Registros en rate_limits: $count";
    }
} catch (Exception $e) {
    $diagnostics['errors'][] = 'Error BD: ' . $e->getMessage();
}

// 3. Verificar directorios de logs y uploads
$logsDir = __DIR__ . '/logs';
$uploadsDir = __DIR__ . '/public/uploads';

if (!is_dir($logsDir)) {
    $diagnostics['warnings'][] = "Directorio logs/ no existe: $logsDir";
} else {
    $diagnostics['info'][] = '✅ Directorio logs/ existe';

    if (!is_writable($logsDir)) {
        $diagnostics['errors'][] = "Directorio logs/ no tiene permisos de escritura";
    }
}

if (!is_dir($uploadsDir)) {
    $diagnostics['warnings'][] = "Directorio uploads/ no existe: $uploadsDir";
} else {
    $diagnostics['info'][] = '✅ Directorio uploads/ existe';

    if (!is_writable($uploadsDir)) {
        $diagnostics['errors'][] = "Directorio uploads/ no tiene permisos de escritura";
    }
}

// 4. Verificar archivos necesarios
$requiredFiles = [
    'config/Database.php',
    'config/Security.php',
    'middleware/Auth.php',
    'middleware/CSRF.php',
    'init_security.php'
];

foreach ($requiredFiles as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path)) {
        $diagnostics['errors'][] = "Archivo faltante: $file";
    }
}

// 5. Verificar extensiones PHP
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'openssl'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $diagnostics['errors'][] = "Extensión PHP faltante: $ext";
    } else {
        $diagnostics['info'][] = "✅ Extensión $ext cargada";
    }
}

// 6. Verificar función getallheaders
if (function_exists('getallheaders')) {
    $diagnostics['info'][] = '✅ getallheaders() disponible';
} else {
    $diagnostics['warnings'][] = 'getallheaders() no disponible (se usará fallback $_SERVER)';
}

// 7. Verificar permisos de archivo .env
try {
    if (file_exists($envFile)) {
        $perms = substr(sprintf('%o', fileperms($envFile)), -4);
        if ($perms === '0644' || $perms === '0664') {
            $diagnostics['info'][] = "✅ Permisos de .env correctos: $perms";
        } else {
            $diagnostics['warnings'][] = "Permisos de .env pueden ser inseguros: $perms (recomendado: 0644)";
        }
    }
} catch (Exception $e) {
    // Silenciar
}

// Determinar estado general
if (count($diagnostics['errors']) > 0) {
    $diagnostics['status'] = 'error';
} elseif (count($diagnostics['warnings']) > 0) {
    $diagnostics['status'] = 'warning';
} else {
    $diagnostics['status'] = 'ok';
}

// Retornar resultado
http_response_code(count($diagnostics['errors']) > 0 ? 500 : 200);
echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
