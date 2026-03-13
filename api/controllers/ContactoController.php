<?php
/**
 * ContactoController.php
 * Gestión de mensajes del formulario de contacto
 *
 * SQL requerido (ejecutar una vez):
 * CREATE TABLE IF NOT EXISTS mensajes_contacto (
 *   id         INT AUTO_INCREMENT PRIMARY KEY,
 *   nombre     VARCHAR(200) NOT NULL,
 *   email      VARCHAR(200) NOT NULL,
 *   rol        VARCHAR(100),
 *   mensaje    TEXT NOT NULL,
 *   estado     ENUM('pendiente','leido','respondido') DEFAULT 'pendiente',
 *   respuesta  TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class ContactoController
{
    private PDO   $db;
    private array $authUser = [];

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
        $this->migrar();
    }

    /* Asegura que la columna `codigo` existe en la tabla */
    private function migrar(): void
    {
        try {
            $cols = $this->db->query("SHOW COLUMNS FROM mensajes_contacto LIKE 'codigo'")->fetchAll();
            if (empty($cols)) {
                $this->db->exec("ALTER TABLE mensajes_contacto ADD COLUMN codigo VARCHAR(20) NULL AFTER id");
                $this->db->exec("UPDATE mensajes_contacto SET codigo = CONCAT('CON-', DATE_FORMAT(created_at,'%y%m%d'), '-', UPPER(SUBSTR(MD5(id),1,4))) WHERE codigo IS NULL");
                $this->db->exec("ALTER TABLE mensajes_contacto MODIFY COLUMN codigo VARCHAR(20) NOT NULL");
                $this->db->exec("ALTER TABLE mensajes_contacto ADD UNIQUE KEY idx_codigo (codigo)");
            }
        } catch (\Throwable $e) {
            // Si la tabla no existe todavía, ignorar
        }
    }

    /* ══════════════════════════════════════════════════
       ROUTER PÚBLICO  →  solo POST
    ══════════════════════════════════════════════════ */
    public function handlePublic(array $segments): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'POST') {
            $this->store();
        } elseif ($method === 'GET' && !empty($_GET['codigo'])) {
            $this->buscarPorCodigo(trim($_GET['codigo']));
        } else {
            $this->error('Método no permitido', 405);
        }
    }

    /* ══════════════════════════════════════════════════
       ROUTER ADMIN
    ══════════════════════════════════════════════════ */
    public function handle(array $segments, array $authUser): void
    {
        $this->authUser = $authUser;

        $method = $_SERVER['REQUEST_METHOD'];
        if (isset($_POST['_method']) && $method === 'POST') {
            $method = strtoupper($_POST['_method']);
        }

        $id     = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;
        $action = $segments[2] ?? null;

        match (true) {
            $method === 'GET'    && $id === null                              => $this->adminList(),
            $method === 'GET'    && $id !== null                              => $this->adminShow($id),
            $method === 'PATCH'  && $id !== null && $action === 'leer'        => $this->marcarLeido($id),
            $method === 'PUT'    && $id !== null && $action === 'responder'   => $this->responder($id),
            $method === 'DELETE' && $id !== null                              => $this->destroy($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══════════════════════════════════════════════════
       POST /contacto  (público — formulario del portal)
    ══════════════════════════════════════════════════ */
    private function store(): void
    {
        $raw   = file_get_contents('php://input');
        $input = $raw ? (json_decode($raw, true) ?? []) : $_POST;

        $nombre  = trim($input['nombre']  ?? '');
        $email   = trim($input['email']   ?? '');
        $rol     = trim($input['rol']     ?? '');
        $mensaje = trim($input['mensaje'] ?? '');

        if (!$nombre)                                                { $this->error('El nombre es requerido', 422); return; }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL))  { $this->error('El correo no es válido', 422); return; }
        if (!$mensaje || strlen($mensaje) < 10)                     { $this->error('El mensaje debe tener al menos 10 caracteres', 422); return; }

        // Aceptar código generado en el cliente si tiene formato válido y no existe ya
        $codigoCliente = strtoupper(trim($input['codigo'] ?? ''));
        if ($codigoCliente && preg_match('/^CON-\d{6}-[A-Z0-9]{4}$/', $codigoCliente)) {
            $check = $this->db->prepare('SELECT id FROM mensajes_contacto WHERE codigo = :c LIMIT 1');
            $check->execute([':c' => $codigoCliente]);
            $codigo = $check->fetch() ? $this->generarCodigo() : $codigoCliente;
        } else {
            $codigo = $this->generarCodigo();
        }

        $ip        = $_SERVER['REMOTE_ADDR']     ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $this->db->prepare("
            INSERT INTO mensajes_contacto (codigo, nombre, email, rol, mensaje, estado, ip_address, user_agent, created_at, updated_at)
            VALUES (:codigo, :nombre, :email, :rol, :mensaje, 'pendiente', :ip, :ua, NOW(), NOW())
        ");
        $ok = $stmt->execute([
            ':codigo'  => $codigo,
            ':nombre'  => $this->clean($nombre),
            ':email'   => strtolower($email),
            ':rol'     => $this->clean($rol),
            ':mensaje' => $this->clean($mensaje),
            ':ip'      => $ip,
            ':ua'      => $userAgent,
        ]);

        if (!$ok) { $this->error('Error al registrar el mensaje. Intente nuevamente.', 500); return; }

        $this->success(['message' => '¡Gracias! Tu mensaje ha sido recibido. Te responderemos pronto.', 'codigo' => $codigo], 201);
    }

    /* ══════════════════════════════════════════════════
       GET /admin/contacto
    ══════════════════════════════════════════════════ */
    private function adminList(): void
    {
        $where  = [];
        $params = [];

        if (!empty($_GET['estado'])) {
            $where[] = 'estado = :estado';
            $params[':estado'] = $_GET['estado'];
        }
        if (!empty($_GET['q'])) {
            $q = '%' . trim($_GET['q']) . '%';
            $where[] = '(nombre LIKE :q1 OR email LIKE :q2 OR mensaje LIKE :q3)';
            $params[':q1'] = $q; $params[':q2'] = $q; $params[':q3'] = $q;
        }

        $cond = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $this->db->prepare("SELECT * FROM mensajes_contacto $cond ORDER BY created_at DESC");
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();

        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    /* ══════════════════════════════════════════════════
       GET /admin/contacto/{id}
    ══════════════════════════════════════════════════ */
    private function adminShow(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Mensaje no encontrado', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* ══════════════════════════════════════════════════
       PATCH /admin/contacto/{id}/leer
    ══════════════════════════════════════════════════ */
    private function marcarLeido(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Mensaje no encontrado', 404); return; }

        if ($row['estado'] === 'pendiente') {
            $this->db->prepare("UPDATE mensajes_contacto SET estado='leido', updated_at=NOW() WHERE id=:id")
                ->execute([':id' => $id]);
        }
        $this->success(['message' => 'Marcado como leído']);
    }

    /* ══════════════════════════════════════════════════
       PUT /admin/contacto/{id}/responder
    ══════════════════════════════════════════════════ */
    private function responder(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Mensaje no encontrado', 404); return; }

        $raw       = file_get_contents('php://input');
        $input     = $raw ? (json_decode($raw, true) ?? []) : $_POST;
        $respuesta = trim($input['respuesta'] ?? '');

        if (!$respuesta) { $this->error('La respuesta es requerida', 422); return; }

        $this->db->prepare("
            UPDATE mensajes_contacto SET respuesta=:r, estado='respondido', updated_at=NOW() WHERE id=:id
        ")->execute([':r' => $this->clean($respuesta), ':id' => $id]);

        Security::logSecurityEvent('contacto_respondido', ['by' => $this->authUser['username'] ?? 'admin', 'id' => $id]);
        $this->success(['message' => 'Respuesta guardada correctamente']);
    }

    /* ══════════════════════════════════════════════════
       DELETE /admin/contacto/{id}
    ══════════════════════════════════════════════════ */
    private function destroy(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Mensaje no encontrado', 404); return; }

        $this->db->prepare("DELETE FROM mensajes_contacto WHERE id=:id")->execute([':id' => $id]);
        $this->success(['message' => 'Mensaje eliminado correctamente']);
    }

    /* ══════════════════════════════════════════════════
       GET /contacto?codigo=CON-...  (público — consultar estado)
    ══════════════════════════════════════════════════ */
    private function buscarPorCodigo(string $codigo): void
    {
        $codigo = strtoupper(preg_replace('/[^A-Z0-9\-]/', '', $codigo));
        if (!$codigo) { $this->error('Código inválido', 422); return; }

        $stmt = $this->db->prepare(
            'SELECT codigo, mensaje, estado, respuesta, created_at FROM mensajes_contacto WHERE codigo = :c LIMIT 1'
        );
        $stmt->execute([':c' => $codigo]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) { $this->error('Código no encontrado. Verifica que sea correcto.', 404); return; }

        $labels = [
            'pendiente'  => 'Pendiente de revisión',
            'leido'      => 'En revisión',
            'respondido' => 'Respondido',
        ];

        $this->success(['data' => [
            'codigo'       => $row['codigo'],
            'mensaje'      => mb_substr($row['mensaje'], 0, 80) . (mb_strlen($row['mensaje']) > 80 ? '…' : ''),
            'estado'       => $row['estado'],
            'estado_label' => $labels[$row['estado']] ?? $row['estado'],
            'respuesta'    => $row['estado'] === 'respondido' ? ($row['respuesta'] ?? null) : null,
            'fecha'        => date('d/m/Y', strtotime($row['created_at'])),
        ]]);
    }

    /* ── Generador de código único ── */
    private function generarCodigo(): string
    {
        $intentos = 0;
        do {
            $codigo = 'CON-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
            $check  = $this->db->prepare('SELECT id FROM mensajes_contacto WHERE codigo = :c LIMIT 1');
            $check->execute([':c' => $codigo]);
            $intentos++;
        } while ($check->fetch() && $intentos < 10);
        return $codigo;
    }

    /* ── Helpers ── */
    private function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM mensajes_contacto WHERE id=:id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function formatRow(array $row): array
    {
        $row['id'] = (int)$row['id'];
        return $row;
    }

    private function clean(string $v): string
    {
        return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
    }

    private function success(array $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function error(string $message, int $code = 400): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
