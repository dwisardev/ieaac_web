<?php
/**
 * Clase Database - Conexión segura a MySQL con PDO
 * I.E. Andrés Avelino Cáceres
 * Compatible PHP 8.5+ - Sin warnings
 */

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    private $collation = 'utf8mb4_unicode_ci';
    public $conn;
    
    private static $connectionAttempts = 0;
    private static $maxConnectionAttempts = 3;
    private static $connectionTimeout = 5;

    public function __construct() {
        $this->loadEnv();
        
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->port = $_ENV['DB_PORT'] ?? '3306';
        $this->db_name = $_ENV['DB_NAME'] ?? 'ieandres_db';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
        
        $this->validateCredentials();
    }

    private function loadEnv() {
        $envFile = __DIR__ . '/../../.env';
        
        if (!file_exists($envFile)) {
            error_log("ADVERTENCIA: Archivo .env no encontrado");
            return;
        }
        
        try {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) {
                    continue;
                }
                
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    $value = trim($value, '"\'');
                    
                    if (preg_match('/^[A-Z_][A-Z0-9_]*$/i', $key)) {
                        $_ENV[$key] = $value;
                        putenv("$key=$value");
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error al cargar .env: " . $e->getMessage());
        }
    }

    private function validateCredentials() {
        if (empty($this->host) || !$this->isValidHost($this->host)) {
            throw new Exception("Host de base de datos inválido");
        }
        
        if (!is_numeric($this->port) || $this->port < 1 || $this->port > 65535) {
            throw new Exception("Puerto de base de datos inválido");
        }
        
        if (empty($this->db_name) || !preg_match('/^[a-zA-Z0-9_]+$/', $this->db_name)) {
            throw new Exception("Nombre de base de datos inválido");
        }
        
        if (empty($this->username)) {
            throw new Exception("Usuario de base de datos no puede estar vacío");
        }
    }

    private function isValidHost($host) {
        if ($host === 'localhost' || $host === '127.0.0.1') {
            return true;
        }
        
        return filter_var($host, FILTER_VALIDATE_IP) !== false || 
               filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) !== false;
    }

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        if (self::$connectionAttempts >= self::$maxConnectionAttempts) {
            throw new Exception("Máximo de intentos de conexión excedido");
        }

        self::$connectionAttempts++;

        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $this->host,
                $this->port,
                $this->db_name,
                $this->charset
            );
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => false,
                PDO::ATTR_TIMEOUT            => self::$connectionTimeout,
                PDO::ATTR_STRINGIFY_FETCHES  => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            // Ejecutar SET NAMES después de la conexión (compatible PHP 8.5+)
            $this->conn->exec("SET NAMES {$this->charset} COLLATE {$this->collation}");
            
            // Configurar zona horaria
            // Hosting compartido no suele tener las tablas mysql.time_zone_name pobladas,
            // por eso se intenta primero con el nombre (America/Lima) y si falla
            // se calcula el offset UTC desde PHP (-05:00) que siempre funciona.
            $timezone = $_ENV['APP_TIMEZONE'] ?? 'America/Lima';
            try {
                $this->conn->exec("SET time_zone = '$timezone'");
            } catch (PDOException $tzError) {
                try {
                    $tz        = new DateTimeZone($timezone);
                    $offsetSec = $tz->getOffset(new DateTime('now', $tz));
                    $hours     = (int)($offsetSec / 3600);
                    $minutes   = abs((int)(($offsetSec % 3600) / 60));
                    $utcOffset = sprintf('%+03d:%02d', $hours, $minutes);
                    $this->conn->exec("SET time_zone = '$utcOffset'");
                } catch (Exception $fallback) {
                    error_log('[DB_WARNING] No se pudo establecer timezone "' . $timezone . '": ' . $fallback->getMessage());
                }
            }
            
            // Configurar modo SQL estricto
            $this->conn->exec("SET sql_mode = 'STRICT_ALL_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
            
            self::$connectionAttempts = 0;
            
            if ($this->isDebugMode()) {
                error_log("✓ Conexión DB establecida: {$this->db_name}@{$this->host}:{$this->port}");
            }
            
        } catch(PDOException $exception) {
            $errorCode = $exception->getCode();
            $errorMessage = $this->sanitizeErrorMessage($exception->getMessage());
            
            error_log("✗ Error DB [{$errorCode}]: {$errorMessage}");
            
            if ($this->isProductionMode()) {
                throw new Exception("Error al conectar con la base de datos. Por favor contacte al administrador.");
            } else {
                throw new Exception("Error de conexión [{$errorCode}]: {$errorMessage}");
            }
        }

        return $this->conn;
    }

    private function sanitizeErrorMessage($message) {
        $message = preg_replace('/password[\'"]?\s*[:=]\s*[\'"]?[^\s\'"]+/i', 'password=***', $message);
        $message = str_replace($this->password, '***', $message);
        $message = str_replace($this->username, '***', $message);
        return $message;
    }

    private function isDebugMode() {
        return isset($_ENV['APP_DEBUG']) && 
               ($_ENV['APP_DEBUG'] === 'true' || $_ENV['APP_DEBUG'] === '1');
    }

    private function isProductionMode() {
        return isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production';
    }

    public function closeConnection() {
        if ($this->conn !== null) {
            $this->conn = null;
            
            if ($this->isDebugMode()) {
                error_log("✓ Conexión DB cerrada correctamente");
            }
        }
    }

    public function isConnected() {
        if ($this->conn === null) {
            return false;
        }
        
        try {
            $this->conn->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    public function reconnect() {
        $this->closeConnection();
        return $this->getConnection();
    }

    public function getInfo() {
        if (!$this->isConnected()) {
            return ['error' => 'No hay conexión activa'];
        }

        if (!$this->isDebugMode()) {
            return ['error' => 'Información no disponible en producción'];
        }

        try {
            $info = [
                'driver' => $this->conn->getAttribute(PDO::ATTR_DRIVER_NAME),
                'server_version' => $this->conn->getAttribute(PDO::ATTR_SERVER_VERSION),
                'client_version' => $this->conn->getAttribute(PDO::ATTR_CLIENT_VERSION),
                'connection_status' => $this->conn->getAttribute(PDO::ATTR_CONNECTION_STATUS),
                'database' => $this->db_name,
                'host' => $this->host,
                'port' => $this->port,
                'charset' => $this->charset
            ];
            
            $stmt = $this->conn->query("SHOW STATUS LIKE 'Threads_connected'");
            $threads = $stmt->fetch();
            $info['threads_connected'] = $threads['Value'] ?? 'N/A';
            
            return $info;
        } catch (PDOException $e) {
            error_log("Error al obtener info DB: " . $e->getMessage());
            return ['error' => 'No se pudo obtener información de la BD'];
        }
    }

    public function prepare($sql) {
        if (!$this->isConnected()) {
            $this->getConnection();
        }
        
        try {
            return $this->conn->prepare($sql);
        } catch (PDOException $e) {
            error_log("Error al preparar query: " . $e->getMessage());
            
            if ($this->isConnectionError($e)) {
                try {
                    $this->reconnect();
                    return $this->conn->prepare($sql);
                } catch (Exception $reconnectError) {
                    error_log("Fallo al reconectar: " . $reconnectError->getMessage());
                }
            }
            
            return false;
        }
    }

    private function isConnectionError($exception) {
        $errorCode = $exception->getCode();
        $connectionErrors = ['HY000', '2006', '2013'];
        return in_array($errorCode, $connectionErrors);
    }

    public function query($sql) {
        if (!$this->isConnected()) {
            $this->getConnection();
        }
        
        try {
            return $this->conn->query($sql);
        } catch (PDOException $e) {
            error_log("Error en query: " . $e->getMessage());
            return false;
        }
    }

    public function beginTransaction() {
        if (!$this->conn->inTransaction()) {
            return $this->conn->beginTransaction();
        }
        return false;
    }

    public function commit() {
        if ($this->conn->inTransaction()) {
            return $this->conn->commit();
        }
        return false;
    }

    public function rollback() {
        if ($this->conn->inTransaction()) {
            return $this->conn->rollBack();
        }
        return false;
    }

    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    public function executeTransaction($queries) {
        try {
            $this->beginTransaction();
            
            foreach ($queries as $query) {
                if (is_array($query)) {
                    $stmt = $this->prepare($query['sql']);
                    $stmt->execute($query['params'] ?? []);
                } else {
                    $this->query($query);
                }
            }
            
            $this->commit();
            return true;
        } catch (Exception $e) {
            $this->rollback();
            error_log("Error en transacción: " . $e->getMessage());
            return false;
        }
    }

    public function __destruct() {
        $this->closeConnection();
    }
}