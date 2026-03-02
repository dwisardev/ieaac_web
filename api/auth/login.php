<?php
/**
 * Login Endpoint — POST /api/auth/login
 * I.E. Andrés Avelino Cáceres
 * 
 * CORRECCIONES APLICADAS:
 * - nombre incluido en respuesta y JWT
 * - Timing attack prevenido con dummy hash
 * - Rate limiting via BD (evita session_start() que falla en cPanel)
 * - sanitizeInput() reemplazado por filtrado manual (preventSQLInjection bloqueaba @)
 */

header('Content-Type: application/json; charset=utf-8');

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/Auth.php';

try {
    // ── Leer body ──────────────────────────────────────────────────────────
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'JSON inválido o vacío']);
        exit();
    }

    // ── Extraer campos ─────────────────────────────────────────────────────
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Campos requeridos',
            'message' => 'Usuario y contraseña son obligatorios'
        ]);
        exit();
    }

    // ── Sanitizar username (solo alfanumérico + . _ - @) ──────────────────
    // NO usar Security::sanitizeInput() aquí porque preventSQLInjection()
    // bloquea el carácter @ y deja el username vacío.
    $username = preg_replace('/[^a-zA-Z0-9._\-@]/', '', $username);

    if (empty($username)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Usuario inválido',
            'message' => 'El nombre de usuario contiene caracteres no permitidos'
        ]);
        exit();
    }

    // ── Conexión a BD ──────────────────────────────────────────────────────
    $database = new Database();
    $db       = $database->getConnection();

    $ip          = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $userAgent   = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 500);
    $maxAttempts = 5;
    $lockSeconds = 900; // 15 min

    // ── Rate limiting via BD ───────────────────────────────────────────────

    // Limpiar intentos viejos
    $db->prepare("DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL :secs SECOND)")
       ->execute([':secs' => $lockSeconds]);

    // Contar intentos recientes por username o IP
    $stmtCount = $db->prepare(
        "SELECT COUNT(*) FROM login_attempts
         WHERE (username = :username OR ip = :ip)
           AND success = 0
           AND created_at > DATE_SUB(NOW(), INTERVAL :secs SECOND)"
    );
    $stmtCount->execute([':username' => $username, ':ip' => $ip, ':secs' => $lockSeconds]);
    $attempts = (int)$stmtCount->fetchColumn();

    if ($attempts >= $maxAttempts) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error'   => 'Demasiados intentos',
            'message' => 'Has excedido el límite de intentos. Intenta en 15 minutos.'
        ]);
        Security::logSecurityEvent('login_rate_limit_exceeded', ['username' => $username, 'ip' => $ip]);
        exit();
    }

    // ── Buscar usuario ─────────────────────────────────────────────────────
    $user     = new User($db);
    $userData = $user->findByUsername($username);

    if (!$userData) {
        // ✅ Timing attack fix: ejecutar dummy hash para igualar tiempo de respuesta
        password_verify($password, '$2y$12$invalido.hash.para.igualar.el.tiempo.de.respuesta.xx');

        // Registrar intento fallido
        $db->prepare("INSERT INTO login_attempts (username, ip, user_agent, success, created_at) VALUES (:username, :ip, :ua, 0, NOW())")
           ->execute([':username' => $username, ':ip' => $ip, ':ua' => $userAgent]);

        Security::logSecurityEvent('login_failed_user_not_found', ['username' => $username]);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => 'Credenciales inválidas',
            'message' => 'Usuario o contraseña incorrectos'
        ]);
        exit();
    }

    // ── Verificar contraseña ───────────────────────────────────────────────
    if (!$user->verifyPassword($password)) {
        $db->prepare("INSERT INTO login_attempts (username, ip, user_agent, success, created_at) VALUES (:username, :ip, :ua, 0, NOW())")
           ->execute([':username' => $username, ':ip' => $ip, ':ua' => $userAgent]);

        Security::logSecurityEvent('login_failed_wrong_password', [
            'username' => $username,
            'user_id'  => $userData['id']
        ]);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => 'Credenciales inválidas',
            'message' => 'Usuario o contraseña incorrectos'
        ]);
        exit();
    }

    // ── Verificar cuenta activa ────────────────────────────────────────────
    if (!$user->isActive()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'Usuario inactivo',
            'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        ]);
        exit();
    }

    // ── Login exitoso — generar tokens ─────────────────────────────────────
    $accessToken = Security::generateJWT(
        $userData['id'],
        $userData['username'],
        $userData['rol'],
        [
            'email'  => $userData['email'],
            'nombre' => $userData['nombre'],    // ✅ AGREGADO
        ]
    );

    $refreshTokenData = Security::generateRefreshToken($userData['id']);
    $expiresAt        = date('Y-m-d H:i:s', $refreshTokenData['expires_at']);

    // Guardar refresh token en BD
    Auth::saveRefreshToken($userData['id'], $refreshTokenData['token'], $expiresAt);

    // Limpiar intentos fallidos de este usuario al loguearse bien
    $db->prepare("DELETE FROM login_attempts WHERE username = :username AND success = 0")
       ->execute([':username' => $username]);

    // Log exitoso
    Security::logSecurityEvent('login_success', [
        'username' => $username,
        'user_id'  => $userData['id'],
        'rol'      => $userData['rol']
    ]);

    // ── Respuesta ──────────────────────────────────────────────────────────
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'data'    => [
            'user' => [
                'id'       => $userData['id'],
                'nombre'   => $userData['nombre'],      // ✅ AGREGADO
                'username' => $userData['username'],
                'email'    => $userData['email'],
                'rol'      => $userData['rol']
            ],
            'tokens' => [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshTokenData['token'],
                'token_type'    => 'Bearer',
                'expires_in'    => (int)($_ENV['JWT_EXPIRATION'] ?? 3600)
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log('[LOGIN ERROR] ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error interno del servidor',
        'message' => 'Ocurrió un error al procesar la solicitud'
    ]);
}