<?php
/**
 * UsersController - CRUD de Usuarios
 * I.E. Andrés Avelino Cáceres
 *
 * Rutas manejadas desde index.php:
 *   GET    /api/admin/usuarios              → listar
 *   POST   /api/admin/usuarios              → crear
 *   PUT    /api/admin/usuarios/{id}         → editar
 *   DELETE /api/admin/usuarios/{id}         → eliminar (soft delete)
 *   PATCH  /api/admin/usuarios/{id}/toggle  → activar/desactivar
 *
 * Seguridad aplicada (OWASP Top 10 2025):
 *   A01 – Broken Access Control    : solo admin puede crear/editar/eliminar
 *   A02 – Cryptographic Failures   : Argon2id via Security::hashPassword()
 *   A03 – Injection                : PDO prepared statements + whitelist
 *   A04 – Insecure Design          : validación en modelo + controlador
 *   A07 – Auth Failures            : JWT verificado en middleware Auth
 *   A09 – Logging & Monitoring     : Security::logSecurityEvent()
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../models/User.php';

class UsersController {

    private $db;
    private $user;
    private $currentUser; // datos del JWT

    public function __construct() {
        $database = new Database();
        $this->db   = $database->getConnection();
        $this->user = new User($this->db);
    }

    /* ──────────────────────────────────────────────
       ENTRY POINT — enrutar según método + segmentos
    ────────────────────────────────────────────── */
    public function handle(array $segments, array $authData) {
        // ✅ Normalizar ID del usuario actual
        // Auth::verify() puede devolver 'id' o 'userId' según versión
        $authData['userId'] = $authData['userId'] ?? $authData['id'] ?? 0;

        $this->currentUser = $authData;
        $method = $_SERVER['REQUEST_METHOD'];

        // /admin/usuarios/{id}/toggle
        if (count($segments) >= 3 && $segments[2] === 'toggle' && $method === 'PATCH') {
            $this->requireRole(['admin']);
            $this->toggle((int)$segments[1]);
            return;
        }

        // /admin/usuarios/{id}/password
        if (count($segments) >= 3 && $segments[2] === 'password' && $method === 'PUT') {
            $this->changePassword((int)$segments[1]);
            return;
        }

        // /admin/usuarios/{id}
        if (isset($segments[1]) && is_numeric($segments[1])) {
            $id = (int)$segments[1];
            match ($method) {
                'GET'    => $this->show($id),
                'PUT'    => $this->requireRole(['admin']) && $this->update($id),
                'DELETE' => $this->requireRole(['admin']) && $this->delete($id),
                default  => $this->methodNotAllowed(),
            };
            return;
        }

        // /admin/usuarios
        match ($method) {
            'GET'  => $this->index(),
            'POST' => $this->requireRole(['admin']) && $this->create(),
            default => $this->methodNotAllowed(),
        };
    }

    /* ──────────────────────────────────────────────
       GET /admin/usuarios — Listar usuarios
    ────────────────────────────────────────────── */
    private function index() {
        try {
            // Construir query con filtros opcionales (whitelist de columnas)
            $conditions = [];
            $params     = [];

            // Filtro rol (OWASP A03: whitelist)
            $rolAllowed = ['admin', 'editor', 'docente', 'usuario'];
            if (!empty($_GET['rol']) && in_array($_GET['rol'], $rolAllowed, true)) {
                $conditions[] = 'rol = :rol';
                $params[':rol'] = $_GET['rol'];
            }

            // Filtro activo
            if (isset($_GET['activo']) && in_array($_GET['activo'], ['0', '1'], true)) {
                $conditions[] = 'activo = :activo';
                $params[':activo'] = (int)$_GET['activo'];
            }

            // Búsqueda por texto (LIKE con PDO — seguro)
            if (!empty($_GET['q'])) {
                $q = trim($_GET['q']);

                // Validar longitud máxima (prevenir DoS)
                if (strlen($q) > 100) {
                    $this->error('Parámetro de búsqueda muy largo (máximo 100 caracteres)', 422);
                    return;
                }

                $q = '%' . $q . '%';
                $conditions[] = '(nombre LIKE :q1 OR username LIKE :q2 OR email LIKE :q3)';
                $params[':q1'] = $q;
                $params[':q2'] = $q;
                $params[':q3'] = $q;
            }

            $where = count($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

            $sql = "SELECT id, nombre, username, email, rol, activo, created_at, updated_at
                    FROM usuarios
                    {$where}
                    ORDER BY created_at DESC";

            $stmt = $this->db->prepare($sql);
            foreach ($params as $k => $v) $stmt->bindValue($k, $v);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Nunca devolver password (OWASP A02)
            $users = array_map(fn($u) => array_diff_key($u, ['password' => '']), $users);

            $this->success($users, 'Usuarios obtenidos correctamente');

        } catch (Exception $e) {
            error_log('UsersController::index error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       GET /admin/usuarios/{id}
    ────────────────────────────────────────────── */
    private function show(int $id) {
        $existing = $this->user->findById($id);
        if (!$existing) {
            $this->notFound('Usuario no encontrado');
            return;
        }
        unset($existing['password']);
        $this->success($existing, 'Usuario obtenido correctamente');
    }

    /* ──────────────────────────────────────────────
       POST /admin/usuarios — Crear usuario
    ────────────────────────────────────────────── */
    private function create() {
        $data = $this->getBody();

        // Validar campos requeridos
        $validation = $this->validateUserData($data, false);
        if (!$validation['valid']) {
            $this->badRequest($validation['errors'][0], $validation['errors']);
            return;
        }

        // Verificar unicidad (OWASP A01)
        if ($this->user->usernameExists($data['username'])) {
            $this->conflict('El nombre de usuario ya está en uso');
            return;
        }
        if ($this->user->emailExists($data['email'])) {
            $this->conflict('El correo electrónico ya está registrado');
            return;
        }

        try {
            $this->user->nombre   = Security::sanitizeInput($data['nombre']);
            $this->user->username = strtolower(Security::sanitizeInput($data['username']));
            $this->user->email    = strtolower(Security::sanitizeInput($data['email']));
            $this->user->password = $data['password']; // hashPassword se hace dentro de create()
            $this->user->rol      = $data['rol'];
            $this->user->activo   = isset($data['activo']) ? (int)$data['activo'] : 1;

            if (!$this->user->create()) {
                $this->serverError('No se pudo crear el usuario');
                return;
            }

            Security::logSecurityEvent('user_created', [
                'created_by' => $this->currentUser['username'],
                'new_user'   => $this->user->username,
                'rol'        => $this->user->rol,
            ]);

            $this->successCreated([
                'id'       => $this->user->id,
                'username' => $this->user->username,
                'email'    => $this->user->email,
                'rol'      => $this->user->rol,
                'activo'   => $this->user->activo,
            ], 'Usuario creado correctamente');

        } catch (Exception $e) {
            error_log('UsersController::create error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       PUT /admin/usuarios/{id} — Editar usuario
    ────────────────────────────────────────────── */
    private function update(int $id) {
        $existing = $this->user->findById($id);
        if (!$existing) {
            $this->notFound('Usuario no encontrado');
            return;
        }

        $data = $this->getBody();

        $validation = $this->validateUserData($data, true);
        if (!$validation['valid']) {
            $this->badRequest($validation['errors'][0], $validation['errors']);
            return;
        }

        // Verificar unicidad excluyendo el propio usuario
        if (!empty($data['username']) && $this->user->usernameExists($data['username'], $id)) {
            $this->conflict('El nombre de usuario ya está en uso por otro usuario');
            return;
        }
        if (!empty($data['email']) && $this->user->emailExists($data['email'], $id)) {
            $this->conflict('El correo electrónico ya está registrado por otro usuario');
            return;
        }

        try {
            $this->user->id       = $id;
            $this->user->nombre   = Security::sanitizeInput($data['nombre']   ?? $existing['nombre']);
            $this->user->username = strtolower(Security::sanitizeInput($data['username'] ?? $existing['username']));
            $this->user->email    = strtolower(Security::sanitizeInput($data['email']    ?? $existing['email']));
            $this->user->rol      = $data['rol']    ?? $existing['rol'];
            $this->user->activo   = isset($data['activo']) ? (int)$data['activo'] : $existing['activo'];

            if (!$this->user->update()) {
                $this->serverError('No se pudo actualizar el usuario');
                return;
            }

            // Actualizar contraseña si se envió (OWASP A02)
            if (!empty($data['password'])) {
                $pwdValidation = Security::validatePasswordStrength($data['password']);
                if (!$pwdValidation['valid']) {
                    $this->badRequest($pwdValidation['errors'][0], $pwdValidation['errors']);
                    return;
                }
                $this->user->updatePassword($data['password']);
            }

            Security::logSecurityEvent('user_updated', [
                'updated_by' => $this->currentUser['username'],
                'user_id'    => $id,
                'username'   => $this->user->username,
            ]);

            $this->success([
                'id'       => $id,
                'username' => $this->user->username,
                'email'    => $this->user->email,
                'rol'      => $this->user->rol,
                'activo'   => $this->user->activo,
            ], 'Usuario actualizado correctamente');

        } catch (Exception $e) {
            error_log('UsersController::update error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       DELETE /admin/usuarios/{id} — Soft delete
    ────────────────────────────────────────────── */
    private function delete(int $id) {
        // Impedir que el admin se elimine a sí mismo (OWASP A01)
        if ($id === (int)$this->currentUser['userId']) {
            $this->forbidden('No puedes eliminar tu propia cuenta');
            return;
        }

        $existing = $this->user->findById($id);
        if (!$existing) {
            $this->notFound('Usuario no encontrado');
            return;
        }

        try {
            $this->user->id = $id;
            $this->user->delete(); // soft delete (activo = 0)

            Security::logSecurityEvent('user_deleted', [
                'deleted_by' => $this->currentUser['username'],
                'user_id'    => $id,
                'username'   => $existing['username'],
            ]);

            $this->success(null, 'Usuario eliminado correctamente');

        } catch (Exception $e) {
            error_log('UsersController::delete error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       PATCH /admin/usuarios/{id}/toggle
    ────────────────────────────────────────────── */
    private function toggle(int $id) {
        if ($id === (int)$this->currentUser['userId']) {
            $this->forbidden('No puedes desactivar tu propia cuenta');
            return;
        }

        $existing = $this->user->findById($id);
        if (!$existing) {
            $this->notFound('Usuario no encontrado');
            return;
        }

        try {
            $nuevoEstado = $existing['activo'] == 1 ? 0 : 1;

            $stmt = $this->db->prepare(
                'UPDATE usuarios SET activo = :activo, updated_at = NOW() WHERE id = :id'
            );
            $stmt->bindParam(':activo', $nuevoEstado, PDO::PARAM_INT);
            $stmt->bindParam(':id',     $id,          PDO::PARAM_INT);
            $stmt->execute();

            Security::logSecurityEvent('user_toggled', [
                'by'       => $this->currentUser['username'],
                'user_id'  => $id,
                'username' => $existing['username'],
                'activo'   => $nuevoEstado,
            ]);

            $this->success(
                ['id' => $id, 'activo' => $nuevoEstado],
                $nuevoEstado ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente'
            );

        } catch (Exception $e) {
            error_log('UsersController::toggle error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       PUT /admin/usuarios/{id}/password
    ────────────────────────────────────────────── */
    private function changePassword(int $id) {
        $isAdmin = $this->currentUser['rol'] === 'admin';
        $isSelf  = (int)$this->currentUser['userId'] === $id;

        if (!$isAdmin && !$isSelf) {
            $this->forbidden('No tienes permisos para cambiar esta contraseña');
            return;
        }

        $existing = $this->user->findById($id);
        if (!$existing) {
            $this->notFound('Usuario no encontrado');
            return;
        }

        $data  = $this->getBody();
        $nueva = $data['password_nueva'] ?? '';

        // Si no es admin, verificar contraseña actual
        if (!$isAdmin) {
            $actual = $data['password_actual'] ?? '';
            if (!password_verify($actual, $existing['password'])) {
                $this->forbidden('La contraseña actual es incorrecta');
                return;
            }
        }

        $pwdValidation = Security::validatePasswordStrength($nueva);
        if (!$pwdValidation['valid']) {
            $this->badRequest($pwdValidation['errors'][0], $pwdValidation['errors']);
            return;
        }

        try {
            $this->user->id = $id;
            $this->user->updatePassword($nueva);

            Security::logSecurityEvent('password_changed', [
                'by'      => $this->currentUser['username'],
                'user_id' => $id,
            ]);

            $this->success(null, 'Contraseña actualizada correctamente');

        } catch (Exception $e) {
            error_log('UsersController::changePassword error: ' . $e->getMessage());
            $this->serverError();
        }
    }

    /* ──────────────────────────────────────────────
       VALIDACIÓN (OWASP A01 + A03)
    ────────────────────────────────────────────── */
    private function validateUserData(array $data, bool $isUpdate): array {
        $errors = [];

        if (!$isUpdate && empty($data['nombre'])) {
            $errors[] = 'El nombre es requerido';
        } elseif (!empty($data['nombre'])) {
            if (mb_strlen($data['nombre']) < 2 || mb_strlen($data['nombre']) > 255)
                $errors[] = 'El nombre debe tener entre 2 y 255 caracteres';
        }

        if (!$isUpdate && empty($data['username'])) {
            $errors[] = 'El nombre de usuario es requerido';
        } elseif (!empty($data['username'])) {
            if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/', $data['username']))
                $errors[] = 'Usuario inválido (3-50 chars, solo letras, números, . - _)';
        }

        if (!$isUpdate && empty($data['email'])) {
            $errors[] = 'El email es requerido';
        } elseif (!empty($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
                $errors[] = 'El email no es válido';
        }

        if (!empty($data['rol'])) {
            if (!in_array($data['rol'], ['admin', 'editor', 'docente', 'usuario'], true))
                $errors[] = 'El rol especificado no es válido';
        }

        if (!empty($data['password'])) {
            $pwdCheck = Security::validatePasswordStrength($data['password']);
            if (!$pwdCheck['valid'])
                $errors = array_merge($errors, $pwdCheck['errors']);
        }

        return ['valid' => empty($errors), 'errors' => $errors];
    }

    /* ──────────────────────────────────────────────
       HELPERS
    ────────────────────────────────────────────── */

    private function requireRole(array $roles): bool {
        if (!in_array($this->currentUser['rol'], $roles, true)) {
            $this->forbidden('No tienes permisos para realizar esta acción');
            return false;
        }
        return true;
    }

    private function getBody(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    private function success($data, string $message = '', int $code = 200): void {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function successCreated($data, string $message): void {
        $this->success($data, $message, 201);
    }

    private function badRequest(string $message, array $errors = []): void {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Datos inválidos',
            'message' => $message,
            'errors'  => $errors,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function forbidden(string $message): void {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'Acceso denegado',
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function notFound(string $message): void {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error'   => 'No encontrado',
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function conflict(string $message): void {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error'   => 'Conflicto',
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function serverError(string $message = 'Error interno del servidor'): void {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Error interno',
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function methodNotAllowed(): void {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error'   => 'Método no permitido',
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}