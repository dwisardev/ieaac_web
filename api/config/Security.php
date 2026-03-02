<?php
/**
 * Clase Security - Implementación de OWASP Top 10 2025
 * I.E. Andrés Avelino Cáceres
 * 
 * Características de seguridad:
 * - A01:2021 – Broken Access Control
 * - A02:2021 – Cryptographic Failures
 * - A03:2021 – Injection
 * - A04:2021 – Insecure Design
 * - A05:2021 – Security Misconfiguration
 * - A06:2021 – Vulnerable and Outdated Components
 * - A07:2021 – Identification and Authentication Failures
 * - A08:2021 – Software and Data Integrity Failures
 * - A09:2021 – Security Logging and Monitoring Failures
 * - A10:2021 – Server-Side Request Forgery
 */

class Security {

    // Configuración de algoritmos
    // PASSWORD_ARGON2ID no se declara aquí porque no todos los builds de PHP lo incluyen.
    // Se resuelve en tiempo de ejecución con defined() en cada método que lo usa.
    private static $jwtAlgorithm = 'HS256';
    private static $encryptionMethod = 'AES-256-CBC';

    /**
     * Validar configuración de seguridad al inicializar
     */
    public static function validateSecurityConfig() {
        $jwtSecret = $_ENV['JWT_SECRET'] ?? '';

        if (empty($jwtSecret) || $jwtSecret === 'secret_key_change_me') {
            throw new Exception('JWT_SECRET no está configurado o usa valor por defecto. Configure una clave segura en el archivo .env');
        }

        if (strlen($jwtSecret) < 32) {
            throw new Exception('JWT_SECRET debe tener al menos 32 caracteres para seguridad máxima');
        }

        return true;
    }

    /**
     * ========================================
     * A03:2021 – PROTECCIÓN CONTRA INYECCIONES
     * ========================================
     */
    
    /**
     * Sanitizar entrada de datos - Prevención XSS
     * @param mixed $data Datos a sanitizar
     * @return mixed Datos sanitizados
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        if (is_string($data)) {
            // Remover espacios al inicio y final
            $data = trim($data);
            
            // Convertir caracteres especiales a entidades HTML
            $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            // Remover backslashes
            $data = stripslashes($data);
            
            // Protección adicional contra inyección SQL
            $data = self::preventSQLInjection($data);
        }
        
        return $data;
    }

    /**
     * Sanitizar para salida HTML
     */
    public static function sanitizeOutput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeOutput'], $data);
        }
        
        return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Prevenir inyección SQL básica (adicional a PDO)
     */
    private static function preventSQLInjection($input) {
        $dangerousPatterns = [
            '/\bUNION\b/i',
            '/\bSELECT\b.*\bFROM\b/i',
            '/\bINSERT\b.*\bINTO\b/i',
            '/\bUPDATE\b.*\bSET\b/i',
            '/\bDELETE\b.*\bFROM\b/i',
            '/\bDROP\b.*\bTABLE\b/i',
            '/\bCREATE\b.*\bTABLE\b/i',
            '/\bEXEC\b/i',
            '/\bEXECUTE\b/i',
            '/--/',
            '/;/',
            '/\/\*/',
            '/\*\//',
            '/@@/',
            '/@/'
        ];
        
        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                self::logSecurityEvent('sql_injection_attempt', [
                    'input' => substr($input, 0, 100),
                    'pattern' => $pattern
                ]);
                return '';
            }
        }
        
        return $input;
    }

    /**
     * Validar entrada contra lista blanca
     */
    public static function validateWhitelist($input, $allowedValues) {
        return in_array($input, $allowedValues, true);
    }

    /**
     * ========================================
     * A01:2021 – VALIDACIONES
     * ========================================
     */
    
    /**
     * Validar email
     */
    public static function validateEmail($email) {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        // Validación adicional de formato
        if (!preg_match('/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
            return false;
        }
        
        return $email;
    }

    /**
     * Validar URL
     */
    public static function validateURL($url) {
        $url = filter_var($url, FILTER_SANITIZE_URL);
        
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }
        
        // Solo permitir http y https
        $parsed = parse_url($url);
        if (!in_array($parsed['scheme'] ?? '', ['http', 'https'])) {
            return false;
        }
        
        return $url;
    }

    /**
     * Validar número entero
     */
    public static function validateInt($value, $min = null, $max = null) {
        if (!is_numeric($value) || (int)$value != $value) {
            return false;
        }
        
        $value = (int)$value;
        
        if ($min !== null && $value < $min) {
            return false;
        }
        
        if ($max !== null && $value > $max) {
            return false;
        }
        
        return $value;
    }

    /**
     * Validar longitud de cadena
     */
    public static function validateLength($string, $min, $max) {
        $length = mb_strlen($string, 'UTF-8');
        return $length >= $min && $length <= $max;
    }

    /**
     * ========================================
     * A02:2021 – CRIPTOGRAFÍA
     * ========================================
     */
    
    /**
     * Hash de contraseña seguro (Argon2id)
     */
    public static function hashPassword($password) {
        // Verificar longitud mínima
        $minLength = $_ENV['PASSWORD_MIN_LENGTH'] ?? 12;
        if (strlen($password) < $minLength) {
            throw new Exception("La contraseña debe tener al menos {$minLength} caracteres");
        }
        
        // Usar Argon2id si está disponible, sino bcrypt
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,  // 64 MB
                'time_cost' => 4,         // 4 iteraciones
                'threads' => 3            // 3 hilos paralelos
            ]);
        } else {
            return password_hash($password, PASSWORD_BCRYPT, [
                'cost' => 12
            ]);
        }
    }

    /**
     * Verificar contraseña
     */
    public static function verifyPassword($password, $hash) {
        if (!password_verify($password, $hash)) {
            self::logSecurityEvent('password_verification_failed', [
                'hash_algo' => password_get_info($hash)['algoName']
            ]);
            return false;
        }
        
        // Verificar si necesita rehash (algoritmo mejorado)
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        if (password_needs_rehash($hash, $algo)) {
            // Devolver true pero indicar que necesita actualización
            return ['verified' => true, 'needs_rehash' => true];
        }
        
        return ['verified' => true, 'needs_rehash' => false];
    }

    /**
     * Validar fortaleza de contraseña
     */
    public static function validatePasswordStrength($password) {
        $errors = [];
        
        $minLength = $_ENV['PASSWORD_MIN_LENGTH'] ?? 12;
        if (strlen($password) < $minLength) {
            $errors[] = "Debe tener al menos {$minLength} caracteres";
        }
        
        if ($_ENV['PASSWORD_REQUIRE_UPPERCASE'] ?? true) {
            if (!preg_match('/[A-Z]/', $password)) {
                $errors[] = "Debe contener al menos una letra mayúscula";
            }
        }
        
        if ($_ENV['PASSWORD_REQUIRE_LOWERCASE'] ?? true) {
            if (!preg_match('/[a-z]/', $password)) {
                $errors[] = "Debe contener al menos una letra minúscula";
            }
        }
        
        if ($_ENV['PASSWORD_REQUIRE_NUMBERS'] ?? true) {
            if (!preg_match('/[0-9]/', $password)) {
                $errors[] = "Debe contener al menos un número";
            }
        }
        
        if ($_ENV['PASSWORD_REQUIRE_SPECIAL'] ?? true) {
            if (!preg_match('/[^A-Za-z0-9]/', $password)) {
                $errors[] = "Debe contener al menos un carácter especial";
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Generar token aleatorio seguro
     */
    public static function generateSecureToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    /**
     * Encriptar datos sensibles
     */
    public static function encrypt($data) {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_me';
        $iv = random_bytes(openssl_cipher_iv_length(self::$encryptionMethod));
        
        $encrypted = openssl_encrypt(
            $data,
            self::$encryptionMethod,
            $key,
            0,
            $iv
        );
        
        // Combinar IV y datos encriptados
        return base64_encode($iv . $encrypted);
    }

    /**
     * Desencriptar datos
     */
    public static function decrypt($data) {
        $key = $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_me';
        $data = base64_decode($data);
        
        $ivLength = openssl_cipher_iv_length(self::$encryptionMethod);
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);
        
        return openssl_decrypt(
            $encrypted,
            self::$encryptionMethod,
            $key,
            0,
            $iv
        );
    }

    /**
     * ========================================
     * A07:2021 – JWT (JSON WEB TOKENS)
     * ========================================
     */
    
    /**
     * Generar token JWT
     */
    public static function generateJWT($userId, $username, $rol, $additionalData = []) {
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$jwtAlgorithm
        ]);
        
        $payload = json_encode(array_merge([
            'iss' => $_ENV['JWT_ISSUER'] ?? 'ieandresavelinocaceres.com',
            'aud' => $_ENV['JWT_AUDIENCE'] ?? 'ieandresavelinocaceres.com',
            'iat' => time(),
            'exp' => time() + (int)($_ENV['JWT_EXPIRATION'] ?? 3600),
            'nbf' => time(),
            'jti' => self::generateSecureToken(16),
            'userId' => $userId,
            'username' => $username,
            'rol' => $rol
        ], $additionalData));

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            $_ENV['JWT_SECRET'],
            true
        );
        
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        self::logSecurityEvent('jwt_generated', [
            'user_id' => $userId,
            'username' => $username,
            'rol' => $rol
        ]);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verificar token JWT
     */
    public static function verifyJWT($jwt) {
        if (empty($jwt)) {
            return false;
        }

        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            self::logSecurityEvent('jwt_invalid_format', ['token' => substr($jwt, 0, 20)]);
            return false;
        }

        list($header, $payload, $signatureProvided) = $tokenParts;

        // Verificar firma
        $base64UrlHeader = $header;
        $base64UrlPayload = $payload;

        $signatureExpected = self::base64UrlEncode(
            hash_hmac(
                'sha256',
                $base64UrlHeader . "." . $base64UrlPayload,
                $_ENV['JWT_SECRET'],
                true
            )
        );

        if (!hash_equals($signatureExpected, $signatureProvided)) {
            self::logSecurityEvent('jwt_invalid_signature');
            return false;
        }

        // Decodificar payload
        $payloadData = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);

        if (!$payloadData) {
            self::logSecurityEvent('jwt_invalid_payload');
            return false;
        }

        // Verificar expiración
        if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) {
            self::logSecurityEvent('jwt_expired', ['exp' => $payloadData['exp'] ?? 'N/A']);
            return false;
        }

        // Verificar not before
        if (isset($payloadData['nbf']) && $payloadData['nbf'] > time()) {
            self::logSecurityEvent('jwt_not_valid_yet');
            return false;
        }

        // Verificar issuer
        $expectedIssuer = $_ENV['JWT_ISSUER'] ?? 'ieandresavelinocaceres.com';
        if (isset($payloadData['iss']) && $payloadData['iss'] !== $expectedIssuer) {
            self::logSecurityEvent('jwt_invalid_issuer');
            return false;
        }

        return $payloadData;
    }

    /**
     * Generar Refresh Token
     */
    public static function generateRefreshToken($userId) {
        $token = self::generateSecureToken(64);
        $expiration = time() + (int)($_ENV['JWT_REFRESH_EXPIRATION'] ?? 604800); // 7 días
        
        return [
            'token' => $token,
            'expires_at' => $expiration,
            'user_id' => $userId
        ];
    }

    /**
     * ========================================
     * A04:2021 – CSRF PROTECTION
     * ========================================
     */
    
    /**
     * Generar token CSRF
     */
    public static function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = self::generateSecureToken(32);
            $_SESSION['csrf_token_time'] = time();
        }
        
        return $_SESSION['csrf_token'];
    }

    /**
     * Verificar token CSRF
     */
    public static function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            self::logSecurityEvent('csrf_token_missing');
            return false;
        }
        
        // Verificar tiempo de expiración (30 minutos)
        $tokenAge = time() - ($_SESSION['csrf_token_time'] ?? 0);
        if ($tokenAge > 1800) {
            self::logSecurityEvent('csrf_token_expired');
            unset($_SESSION['csrf_token']);
            return false;
        }
        
        if (!hash_equals($_SESSION['csrf_token'], $token)) {
            self::logSecurityEvent('csrf_token_invalid');
            return false;
        }
        
        return true;
    }

    /**
     * ========================================
     * A07:2021 – RATE LIMITING
     * ========================================
     */
    
    /**
     * Rate Limiting vía Database - Control de intentos
     * Migrado de sessions para mejor compatibilidad en hosting compartido (cPanel)
     */
    public static function checkRateLimit($identifier, $maxAttempts = null, $timeWindow = null) {
        $maxAttempts = $maxAttempts ?? (int)($_ENV['MAX_LOGIN_ATTEMPTS'] ?? 5);
        $timeWindow = $timeWindow ?? (int)($_ENV['LOCKOUT_TIME'] ?? 900);

        try {
            $db = (new \Database())->getConnection();

            // Verificar si existe la tabla rate_limits
            $tableExists = $db->query("SHOW TABLES LIKE 'rate_limits'")->rowCount() > 0;

            if (!$tableExists) {
                // Tabla no existe - permitir acceso pero loguear
                error_log('[RATE_LIMIT_WARNING] Tabla rate_limits no existe. Ejecuta la migración SQL.');
                return true; // Permitir acceso, pero registrar
            }

            $key = md5($identifier);
            $now = time();
            $windowStart = $now - $timeWindow;

            // Obtener intentos previos en la ventana de tiempo
            $stmt = $db->prepare("
                SELECT id, attempts, blocked_until, first_attempt
                FROM rate_limits
                WHERE identifier_hash = :key
                LIMIT 1
            ");
            $stmt->execute([':key' => $key]);
            $record = $stmt->fetch(\PDO::FETCH_ASSOC);

            // Si está bloqueado actualmente
            if ($record && $record['blocked_until'] && $now < $record['blocked_until']) {
                self::logSecurityEvent('rate_limit_blocked', [
                    'identifier' => $identifier,
                    'remaining_seconds' => $record['blocked_until'] - $now
                ]);
                return false;
            }

            // Si pasó la ventana temporal, resetear
            if (!$record || $record['first_attempt'] < $windowStart) {
                $stmt = $db->prepare("
                    INSERT INTO rate_limits (identifier_hash, attempts, first_attempt, blocked_until, created_at)
                    VALUES (:key, 1, :now, NULL, NOW())
                    ON DUPLICATE KEY UPDATE attempts = 1, first_attempt = :now, blocked_until = NULL, updated_at = NOW()
                ");
                $stmt->execute([':key' => $key, ':now' => $now]);
                return true;
            }

            // Incrementar intentos
            $newAttempts = $record['attempts'] + 1;

            if ($newAttempts > $maxAttempts) {
                // Bloquear por $timeWindow segundos
                $blockedUntil = $now + $timeWindow;
                $stmt = $db->prepare("
                    UPDATE rate_limits
                    SET attempts = :attempts, blocked_until = :blocked_until, updated_at = NOW()
                    WHERE identifier_hash = :key
                ");
                $stmt->execute([
                    ':key' => $key,
                    ':attempts' => $newAttempts,
                    ':blocked_until' => $blockedUntil
                ]);

                self::logSecurityEvent('rate_limit_exceeded', [
                    'identifier' => $identifier,
                    'attempts' => $newAttempts,
                    'blocked_for_seconds' => $timeWindow
                ]);

                return false;
            }

            // Actualizar intentos
            $stmt = $db->prepare("
                UPDATE rate_limits
                SET attempts = :attempts, updated_at = NOW()
                WHERE identifier_hash = :key
            ");
            $stmt->execute([':key' => $key, ':attempts' => $newAttempts]);

            return true;

        } catch (Exception $e) {
            // Si la BD falla, permitir acceso pero loguear error
            error_log('[RATE_LIMIT_ERROR] ' . $e->getMessage());
            if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), 'no existe') !== false) {
                error_log('[RATE_LIMIT_WARNING] Tabla rate_limits no existe. Ejecuta: api/migrations/001_create_rate_limits_table.sql');
            }
            return true; // Permitir acceso, pero registrar error
        }
    }

    /**
     * Resetear rate limit en la base de datos
     */
    public static function resetRateLimit($identifier) {
        try {
            $db = (new \Database())->getConnection();
            $key = md5($identifier);

            $stmt = $db->prepare("
                UPDATE rate_limits
                SET attempts = 0, blocked_until = NULL, updated_at = NOW()
                WHERE identifier_hash = :key
            ");
            $stmt->execute([':key' => $key]);

            return true;
        } catch (Exception $e) {
            error_log('[RESET_RATE_LIMIT_ERROR] ' . $e->getMessage());
            return false;
        }
    }

    /**
     * ========================================
     * CODIFICACIÓN BASE64 URL-SAFE
     * ========================================
     */
    
    private static function base64UrlEncode($text) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }

    private static function base64UrlDecode($text) {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $text));
    }

    /**
     * ========================================
     * A08:2021 – VALIDACIÓN DE ARCHIVOS
     * ========================================
     */
    
    /**
     * Validar extensión de archivo
     */
    public static function validateFileExtension($filename, $allowedExtensions = null) {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        if ($allowedExtensions === null) {
            $allowedExtensions = explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,pdf');
        }
        
        if (!in_array($extension, $allowedExtensions)) {
            self::logSecurityEvent('invalid_file_extension', [
                'filename' => $filename,
                'extension' => $extension
            ]);
            return false;
        }
        
        return true;
    }

    /**
     * Validar tipo MIME de archivo
     */
    public static function validateMimeType($filePath, $allowedMimes) {
        if (!file_exists($filePath)) {
            return false;
        }
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedMimes)) {
            self::logSecurityEvent('invalid_mime_type', [
                'file' => basename($filePath),
                'mime_type' => $mimeType
            ]);
            return false;
        }
        
        return true;
    }

    /**
     * Generar nombre de archivo seguro
     */
    public static function generateSafeFilename($originalFilename) {
        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION);
        $safeName = uniqid('file_', true) . '_' . time() . '_' . bin2hex(random_bytes(8));
        return $safeName . '.' . strtolower($extension);
    }

    /**
     * ========================================
     * A05:2021 – HEADERS DE SEGURIDAD HTTP
     * ========================================
     */
    
    /**
     * Configurar headers de seguridad HTTP
     */
    public static function setSecurityHeaders() {
        // Prevenir Clickjacking
        header("X-Frame-Options: " . ($_ENV['HEADER_X_FRAME_OPTIONS'] ?? 'DENY'));
        
        // Prevenir MIME-Sniffing
        header("X-Content-Type-Options: " . ($_ENV['HEADER_X_CONTENT_TYPE_OPTIONS'] ?? 'nosniff'));
        
        // Protección XSS
        header("X-XSS-Protection: " . ($_ENV['HEADER_X_XSS_PROTECTION'] ?? '1; mode=block'));
        
        // Referrer Policy
        header("Referrer-Policy: " . ($_ENV['HEADER_REFERRER_POLICY'] ?? 'strict-origin-when-cross-origin'));
        
        // Permissions Policy
        header("Permissions-Policy: " . ($_ENV['HEADER_PERMISSIONS_POLICY'] ?? 'geolocation=(), microphone=(), camera=()'));
        
        // Content Security Policy
        $csp = sprintf(
            "default-src %s; script-src %s; style-src %s; img-src %s; font-src %s;",
            $_ENV['CSP_DEFAULT_SRC'] ?? "'self'",
            $_ENV['CSP_SCRIPT_SRC'] ?? "'self' 'unsafe-inline' 'unsafe-eval'",
            $_ENV['CSP_STYLE_SRC'] ?? "'self' 'unsafe-inline'",
            $_ENV['CSP_IMG_SRC'] ?? "'self' data: https:",
            $_ENV['CSP_FONT_SRC'] ?? "'self' data:"
        );
        header("Content-Security-Policy: " . $csp);
        
        // HSTS (solo en producción con HTTPS)
        if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production' && 
            isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
        }
        
        // Remover headers que exponen información
        header_remove('X-Powered-By');
        header_remove('Server');
    }

    /**
     * ========================================
     * CORS (Cross-Origin Resource Sharing)
     * ========================================
     */
    
    /**
     * Configurar CORS
     */
    public static function setCORSHeaders() {
        $allowedOrigins = explode(',', $_ENV['ALLOWED_ORIGINS'] ?? 'https://ieandresavelinocaceres.com');
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Verificar si el origen está permitido
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: " . $origin);
            header("Access-Control-Allow-Credentials: true");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With");
        header("Access-Control-Max-Age: 3600");
        
        // Manejar preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    /**
     * ========================================
     * A09:2021 – LOGGING Y MONITOREO
     * ========================================
     */
    
    /**
     * Log de eventos de seguridad
     */
    public static function logSecurityEvent($event, $details = []) {
        if (!isset($_ENV['SECURITY_LOG_ENABLED']) || $_ENV['SECURITY_LOG_ENABLED'] !== 'true') {
            return;
        }
        
        $logDir = __DIR__ . '/../logs';
        $logFile = $logDir . '/security.log';
        
        // Crear directorio si no existe
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => self::getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'details' => $details
        ];
        
        $logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        
        try {
            file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
        } catch (Exception $e) {
            error_log("Error al escribir log de seguridad: " . $e->getMessage());
        }
    }

    /**
     * Leer logs de seguridad (solo para admin)
     */
    public static function getSecurityLogs($limit = 100) {
        $logFile = __DIR__ . '/../logs/security.log';
        
        if (!file_exists($logFile)) {
            return [];
        }
        
        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $lines = array_slice($lines, -$limit);
        
        $logs = [];
        foreach ($lines as $line) {
            $logs[] = json_decode($line, true);
        }
        
        return array_reverse($logs);
    }

    /**
     * ========================================
     * UTILIDADES ADICIONALES
     * ========================================
     */
    
    /**
     * Obtener IP real del cliente
     */
    public static function getClientIP() {
        $ipHeaders = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];
        
        foreach ($ipHeaders as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                
                // Si contiene múltiples IPs, tomar la primera
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                
                // Validar que sea una IP válida
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Verificar si la petición es AJAX
     */
    public static function isAjaxRequest() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    /**
     * Limpiar logs antiguos
     */
    public static function cleanOldLogs($days = null) {
        $days = $days ?? (int)($_ENV['LOG_RETENTION_DAYS'] ?? 30);
        $logDir = __DIR__ . '/../logs';
        
        if (!is_dir($logDir)) {
            return;
        }
        
        $cutoffTime = time() - ($days * 24 * 60 * 60);
        
        $files = glob($logDir . '/*.log');
        foreach ($files as $file) {
            if (filemtime($file) < $cutoffTime) {
                unlink($file);
            }
        }
    }
}