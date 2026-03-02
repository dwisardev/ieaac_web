<?php
/**
 * API Router Principal - I.E. Andrés Avelino Cáceres
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

// Validar configuración de seguridad
require_once __DIR__ . '/init_security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// HSTS: Fuerza HTTPS por 1 año (incluir subdominios)
header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

// CSP: Content Security Policy
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://ieandresavelinocaceres.com");

// CORS
$allowedOrigins = [
    'https://ieandresavelinocaceres.com',
    'https://www.ieandresavelinocaceres.com',
    'http://localhost:3000',    // React dev server
    'http://localhost:5173',    // Vite dev server
    'http://localhost:8000',    // PHP dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Validar origin contra lista blanca (no usar substring)
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
header('Access-Control-Max-Age: 3600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/config/Security.php';
require_once __DIR__ . '/middleware/CSRF.php';

// Parsear ruta
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api/?#', '', $path);
$path = trim($path, '/');
$segments = $path ? explode('/', $path) : [];

// ── Raíz ───────────────────────────────────────────────────
if (empty($path)) {
    echo json_encode(['success' => true, 'message' => 'API I.E. Andrés Avelino Cáceres', 'version' => '1.0.0', 'status' => 'online'], JSON_UNESCAPED_UNICODE);
    exit();
}

// ── Test BD ────────────────────────────────────────────────
if ($path === 'test') {
    try {
        $db   = (new Database())->getConnection();
        $info = $db->query("SELECT DATABASE() as db, VERSION() as version, NOW() as time")->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'message' => 'Conexión exitosa', 'data' => $info], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        error_log('[TEST_DB] ' . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    }
    exit();
}

try {
    $seg0 = $segments[0] ?? '';

    // ── AUTH ────────────────────────────────────────────────
    if ($seg0 === 'auth') {
        $authFile = __DIR__ . '/auth/' . ($segments[1] ?? 'index') . '.php';
        if (file_exists($authFile)) {
            require_once $authFile;
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint auth no encontrado']);
        }
        exit();
    }

    // ── RUTAS PÚBLICAS con prefijo /public/ ─────────────────
    // Ej: /api/public/docentes  /api/public/noticias
    if ($seg0 === 'public' && isset($segments[1])) {
        $resource = $segments[1];
        $publicFile = __DIR__ . '/public/' . $resource . '.php';
        if (file_exists($publicFile)) {
            require_once $publicFile;
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Recurso público '$resource' no encontrado"]);
        }
        exit();
    }

    // ── RUTAS PÚBLICAS sin prefijo ──────────────────────────
    // Ej: /api/noticias  /api/noticias/5
    $publicResources = ['noticias', 'eventos', 'comunicados', 'docentes', 'informacion', 'banners'];
    if (in_array($seg0, $publicResources)) {
        // noticias usa el controller propio
        if ($seg0 === 'noticias') {
            require_once __DIR__ . '/controllers/NoticiasController.php';
            (new NoticiasController())->handlePublic($segments);
            exit();
        }
        // el resto: buscar en /public/
        $publicFile = __DIR__ . '/public/' . $seg0 . '.php';
        if (file_exists($publicFile)) {
            require_once $publicFile;
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Recurso público '$seg0' no encontrado"]);
        }
        exit();
    }

    // ── RUTAS ADMIN ─────────────────────────────────────────
    if ($seg0 === 'admin') {
        require_once __DIR__ . '/middleware/Auth.php';

        $auth = Auth::verify();
        if (!$auth['success']) {
            http_response_code(401);
            echo json_encode($auth);
            exit();
        }

        if (!in_array($auth['data']['rol'], ['admin', 'editor'])) {
            http_response_code(403);

            // Log de intento de acceso denegado
            \Security::logSecurityEvent('unauthorized_access_attempt', [
                'user_id' => $auth['data']['userId'] ?? null,
                'username' => $auth['data']['username'] ?? null,
                'required_role' => 'admin|editor',
                'actual_role' => $auth['data']['rol'] ?? null,
                'requested_resource' => $path
            ]);

            echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
            exit();
        }

        // Validar CSRF token SOLO para solicitudes que modifiquen datos
        // GET, HEAD, OPTIONS: no requieren CSRF
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
            $csrfValidation = CSRFMiddleware::validate();
            if (!$csrfValidation['success']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => $csrfValidation['error']]);
                exit();
            }
        }

        $resource = $segments[1] ?? 'dashboard';

        // admin/noticias
        if ($resource === 'noticias') {
            require_once __DIR__ . '/controllers/NoticiasController.php';
            (new NoticiasController())->handle(array_slice($segments, 1), $auth['data']);
            exit();
        }

        // admin/usuarios
        if ($resource === 'usuarios') {
            require_once __DIR__ . '/controllers/UsersController.php';
            (new UsersController())->handle(array_slice($segments, 1), $auth['data']);
            exit();
        }

        // admin/comunicados, admin/docentes, etc → buscar en /admin/
        $adminFile = __DIR__ . '/admin/' . $resource . '.php';
        if (file_exists($adminFile)) {
            require_once $adminFile;
            exit();
        }

        http_response_code(404);
        echo json_encode(['success' => false, 'error' => "Recurso admin '$resource' no encontrado"], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ── 404 ────────────────────────────────────────────────
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Endpoint no encontrado', 'path' => $path], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log('[API ERROR] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor']);
}