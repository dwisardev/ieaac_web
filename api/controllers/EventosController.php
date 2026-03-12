<?php
/**
 * EventosController.php
 * Gestión de eventos institucionales
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class EventosController
{
    private PDO   $db;
    private array $authUser = [];

    private string $uploadDir;
    private array  $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct()
    {
        $this->db        = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/eventos/';
    }

    public function handlePublic(array $segments): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;

        match (true) {
            $method === 'GET' && $id === null => $this->publicList(),
            $method === 'GET' && $id !== null => $this->publicShow($id),
            default => $this->error('Método no permitido', 405),
        };
    }

    public function handle(array $segments, array $authUser): void
    {
        $authUser['userId'] = $authUser['userId'] ?? $authUser['id'] ?? 0;
        $this->authUser     = $authUser;

        $method = $_SERVER['REQUEST_METHOD'];
        if (isset($_POST['_method']) && $method === 'POST') {
            $method = strtoupper($_POST['_method']);
        }

        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;

        match (true) {
            $method === 'GET'    && $id === null => $this->adminList(),
            $method === 'GET'    && $id !== null => $this->publicShow($id),
            $method === 'POST'   && $id === null => $this->store(),
            $method === 'PUT'    && $id !== null => $this->update($id),
            $method === 'DELETE' && $id !== null => $this->destroy($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* GET /api/eventos */
    private function publicList(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, titulo, descripcion, fecha_evento, hora_inicio, hora_fin, imagen, ubicacion
            FROM   eventos
            WHERE  activo = 1
            ORDER  BY fecha_evento ASC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function publicShow(int $id): void
    {
        $stmt = $this->db->prepare("SELECT * FROM eventos WHERE id = :id AND activo = 1 LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->error('Evento no encontrado', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    private function adminList(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM eventos ORDER BY fecha_evento ASC");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function store(): void
    {
        if (empty(trim($_POST['titulo'] ?? ''))) {
            $this->error('El título es requerido', 422); return;
        }
        if (empty($_POST['fecha_evento'] ?? '')) {
            $this->error('La fecha del evento es requerida', 422); return;
        }

        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name'])) {
            $imagenNombre = $this->uploadImage($_FILES['imagen']);
            if ($imagenNombre === false) {
                $this->error('Error al subir imagen.', 422); return;
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO eventos
                (titulo, descripcion, fecha_evento, hora_inicio, hora_fin, imagen, ubicacion, activo, created_at)
            VALUES
                (:titulo, :descripcion, :fecha_evento, :hora_inicio, :hora_fin, :imagen, :ubicacion, 1, NOW())
        ");
        $stmt->execute([
            ':titulo'       => $this->clean($_POST['titulo']),
            ':descripcion'  => $this->clean($_POST['descripcion'] ?? ''),
            ':fecha_evento' => $_POST['fecha_evento'],
            ':hora_inicio'  => $_POST['hora_inicio'] ?? null,
            ':hora_fin'     => $_POST['hora_fin']    ?? null,
            ':imagen'       => $imagenNombre,
            ':ubicacion'    => $this->clean($_POST['ubicacion'] ?? ''),
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('evento_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Evento creado correctamente', 'id' => $newId], 201);
    }

    private function update(int $id): void
    {
        $stmt = $this->db->prepare("SELECT * FROM eventos WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Evento no encontrado', 404); return; }

        $imagenNombre = $existing['imagen'];
        if (!empty($_FILES['imagen']['name'])) {
            $nueva = $this->uploadImage($_FILES['imagen']);
            if ($nueva === false) { $this->error('Error al subir imagen.', 422); return; }
            if ($existing['imagen']) {
                $oldPath = $this->uploadDir . $existing['imagen'];
                if (file_exists($oldPath)) @unlink($oldPath);
            }
            $imagenNombre = $nueva;
        }

        $stmt = $this->db->prepare("
            UPDATE eventos SET
                titulo       = :titulo,
                descripcion  = :descripcion,
                fecha_evento = :fecha_evento,
                hora_inicio  = :hora_inicio,
                hora_fin     = :hora_fin,
                imagen       = :imagen,
                ubicacion    = :ubicacion
            WHERE id = :id
        ");
        $stmt->execute([
            ':titulo'       => $this->clean($_POST['titulo']       ?? $existing['titulo']),
            ':descripcion'  => $this->clean($_POST['descripcion']  ?? $existing['descripcion'] ?? ''),
            ':fecha_evento' => $_POST['fecha_evento']              ?? $existing['fecha_evento'],
            ':hora_inicio'  => $_POST['hora_inicio']               ?? $existing['hora_inicio'],
            ':hora_fin'     => $_POST['hora_fin']                  ?? $existing['hora_fin'],
            ':imagen'       => $imagenNombre,
            ':ubicacion'    => $this->clean($_POST['ubicacion']    ?? $existing['ubicacion']   ?? ''),
            ':id'           => $id,
        ]);

        Security::logSecurityEvent('evento_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Evento actualizado correctamente']);
    }

    private function destroy(int $id): void
    {
        $stmt = $this->db->prepare("SELECT imagen FROM eventos WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Evento no encontrado', 404); return; }

        $this->db->prepare("DELETE FROM eventos WHERE id = :id")->execute([':id' => $id]);

        Security::logSecurityEvent('evento_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Evento eliminado correctamente']);
    }

    private function formatRow(array $row): array
    {
        $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base  = "{$proto}://{$host}/public/uploads/eventos/";

        $row['id']     = (int)$row['id'];
        $row['activo'] = isset($row['activo']) ? (bool)$row['activo'] : true;
        $row['imagen'] = $row['imagen'] && !str_starts_with($row['imagen'], 'http')
            ? $base . $row['imagen']
            : $row['imagen'];

        return $row;
    }

    private function uploadImage(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  2 * 1024 * 1024) return false;

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, $this->allowedMime)) return false;
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);

        $nombre = bin2hex(random_bytes(16)) . '.' . $this->allowedMime[$mime];
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
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

    private function error(string $message, int $code = 400, array $errors = []): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
