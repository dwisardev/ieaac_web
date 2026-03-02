<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNOSTIC TEST - IEAAC ===\n\n";

// Info basica
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'unknown') . "\n";
echo "Script path: " . __FILE__ . "\n\n";

// Constantes PHP
echo "--- Constantes PHP ---\n";
echo "PASSWORD_BCRYPT: " . (defined('PASSWORD_BCRYPT') ? PASSWORD_BCRYPT : 'NO DEFINIDA') . "\n";
echo "PASSWORD_DEFAULT: " . (defined('PASSWORD_DEFAULT') ? PASSWORD_DEFAULT : 'NO DEFINIDA') . "\n";
echo "PASSWORD_ARGON2I: " . (defined('PASSWORD_ARGON2I') ? 'DEFINIDA (' . PASSWORD_ARGON2I . ')' : 'NO DEFINIDA') . "\n";
echo "PASSWORD_ARGON2ID: " . (defined('PASSWORD_ARGON2ID') ? 'DEFINIDA (' . PASSWORD_ARGON2ID . ')' : 'NO DEFINIDA') . "\n\n";

// PDO
echo "--- PDO ---\n";
echo "PDO class: " . (class_exists('PDO') ? 'OK' : 'NO DISPONIBLE') . "\n";
if (class_exists('PDO')) {
    $drivers = PDO::getAvailableDrivers();
    echo "Drivers: " . implode(', ', $drivers) . "\n";
    echo "MySQL driver: " . (in_array('mysql', $drivers) ? 'OK' : 'NO DISPONIBLE') . "\n";
}
echo "\n";

// Archivos de configuracion
echo "--- Archivos de configuracion ---\n";
$filesToCheck = [
    'config/Security.php',
    'config/Database.php',
    'config/FileUpload.php',
    'middleware/Auth.php',
    'middleware/CSRF.php',
    'middleware/RateLimit.php',
    'middleware/Validate.php',
];

foreach ($filesToCheck as $file) {
    $path = __DIR__ . '/' . $file;
    $exists = file_exists($path);
    $readable = $exists ? is_readable($path) : false;
    echo "$file: " . ($exists ? 'existe' : 'NO EXISTE') . ($exists ? ($readable ? ', legible' : ', NO LEGIBLE') : '') . "\n";
}
echo "\n";

// Cargar Security.php
echo "--- Carga de Security.php ---\n";
try {
    require_once __DIR__ . '/config/Security.php';
    echo "Security.php: CARGADO OK\n";
} catch (ParseError $e) {
    echo "Security.php ParseError: " . $e->getMessage() . " en linea " . $e->getLine() . "\n";
} catch (Error $e) {
    echo "Security.php Error: " . $e->getMessage() . " en linea " . $e->getLine() . "\n";
} catch (Throwable $e) {
    echo "Security.php Throwable: " . $e->getMessage() . "\n";
}
echo "\n";

// Cargar Database.php
echo "--- Carga de Database.php ---\n";
try {
    require_once __DIR__ . '/config/Database.php';
    echo "Database.php: CARGADO OK\n";
} catch (ParseError $e) {
    echo "Database.php ParseError: " . $e->getMessage() . " en linea " . $e->getLine() . "\n";
} catch (Error $e) {
    echo "Database.php Error: " . $e->getMessage() . " en linea " . $e->getLine() . "\n";
} catch (Throwable $e) {
    echo "Database.php Throwable: " . $e->getMessage() . "\n";
}
echo "\n";

// Archivo .env
echo "--- Archivo .env ---\n";
$envPaths = [
    __DIR__ . '/.env',
    __DIR__ . '/../.env',
    dirname(__DIR__) . '/.env',
];
foreach ($envPaths as $envPath) {
    echo "Ruta: $envPath\n";
    echo "  Existe: " . (file_exists($envPath) ? 'SI' : 'NO') . "\n";
    if (file_exists($envPath)) {
        echo "  Legible: " . (is_readable($envPath) ? 'SI' : 'NO') . "\n";
        if (is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                // Mostrar solo la clave, ocultar el valor
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $key = trim($parts[0]);
                    $val = trim($parts[1]);
                    // Ocultar passwords y secrets
                    if (stripos($key, 'pass') !== false || stripos($key, 'secret') !== false || stripos($key, 'key') !== false) {
                        $val = str_repeat('*', min(strlen($val), 8));
                    }
                    echo "  $key = $val\n";
                }
            }
        }
    }
}
echo "\n";

// Conexion a BD
echo "--- Conexion a base de datos ---\n";
if (class_exists('Database')) {
    try {
        $database = new Database();
        $db = $database->getConnection();
        if ($db) {
            $stmt = $db->query("SELECT DATABASE() as db_name, VERSION() as mysql_version, NOW() as server_time");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "Conexion: OK\n";
            echo "Base de datos: " . $row['db_name'] . "\n";
            echo "MySQL version: " . $row['mysql_version'] . "\n";
            echo "Hora servidor: " . $row['server_time'] . "\n";

            // Verificar tabla usuarios
            $stmt2 = $db->query("SHOW TABLES LIKE 'usuarios'");
            echo "Tabla 'usuarios': " . ($stmt2->rowCount() > 0 ? 'EXISTE' : 'NO EXISTE') . "\n";

            // Verificar tabla login_attempts
            $stmt3 = $db->query("SHOW TABLES LIKE 'login_attempts'");
            echo "Tabla 'login_attempts': " . ($stmt3->rowCount() > 0 ? 'EXISTE' : 'NO EXISTE') . "\n";

            if ($stmt3->rowCount() > 0) {
                $stmt4 = $db->query("DESCRIBE login_attempts");
                $cols = $stmt4->fetchAll(PDO::FETCH_COLUMN);
                echo "Columnas login_attempts: " . implode(', ', $cols) . "\n";
            }
        } else {
            echo "Conexion: FALLO (getConnection() retorno null)\n";
        }
    } catch (Throwable $e) {
        echo "Conexion FALLO: " . $e->getMessage() . "\n";
    }
} else {
    echo "Clase Database no disponible (fallo la carga del archivo)\n";
}
echo "\n";

// Directorio logs
echo "--- Directorio logs ---\n";
$logsDir = __DIR__ . '/logs';
echo "Existe: " . (is_dir($logsDir) ? 'SI' : 'NO') . "\n";
if (is_dir($logsDir)) {
    echo "Escribible: " . (is_writable($logsDir) ? 'SI' : 'NO') . "\n";
}
echo "\n";

// Cargar index.php parcialmente
echo "--- Verificar index.php ---\n";
$indexPath = __DIR__ . '/index.php';
echo "index.php existe: " . (file_exists($indexPath) ? 'SI' : 'NO') . "\n";
if (file_exists($indexPath)) {
    // Leer primeras lineas para detectar BOM o espacios
    $handle = fopen($indexPath, 'r');
    $firstBytes = fread($handle, 10);
    fclose($handle);
    $hex = bin2hex($firstBytes);
    echo "Primeros bytes (hex): $hex\n";
    $hasBOM = (substr($hex, 0, 6) === 'efbbbf');
    $hasSpaces = (substr($firstBytes, 0, 1) === ' ' || substr($firstBytes, 0, 1) === "\n" || substr($firstBytes, 0, 1) === "\r");
    echo "Tiene BOM UTF-8: " . ($hasBOM ? 'SI (PROBLEMA!)' : 'NO') . "\n";
    echo "Empieza con espacio/newline: " . ($hasSpaces ? 'SI (PROBLEMA!)' : 'NO') . "\n";
}
echo "\n";

// Verificar todos los PHP por BOM/espacios
echo "--- Verificar BOM/espacios en archivos PHP criticos ---\n";
$criticalFiles = [
    'index.php',
    'config/Security.php',
    'config/Database.php',
    'middleware/Auth.php',
    'middleware/CSRF.php',
];
foreach ($criticalFiles as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path)) { echo "$file: NO EXISTE\n"; continue; }
    $handle = fopen($path, 'r');
    $first4 = fread($handle, 4);
    fclose($handle);
    $hex = bin2hex($first4);
    $hasBOM = (substr($hex, 0, 6) === 'efbbbf');
    $firstChar = substr($first4, 0, 1);
    $hasLeading = ($firstChar === ' ' || $firstChar === "\n" || $firstChar === "\r" || $firstChar === "\t");
    if ($hasBOM || $hasLeading) {
        echo "$file: PROBLEMA (hex: $hex)\n";
    } else {
        echo "$file: OK\n";
    }
}
echo "\n";

echo "=== FIN DEL DIAGNOSTICO ===\n";
