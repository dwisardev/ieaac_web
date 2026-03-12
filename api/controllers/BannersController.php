<?php
/**
 * BannersController.php
 * Gestión del carrusel de banners
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class BannersController
{
    private PDO   $db;
    private array $authUser = [];

    private string $uploadDir;
    private string $uploadUrl;

    private array $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct()
    {
        $this->db        = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/banners/';
        $proto           = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host            = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $this->uploadUrl = "{$proto}://{$host}/public/uploads/banners/";
    }

    public function handlePublic(array $segments): void
    {
        match ($_SERVER['REQUEST_METHOD']) {
            'GET'   => $this->publicList(),
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

        $id     = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;
        $action = $segments[2] ?? null;

        match (true) {
            $method === 'GET'    && $id === null                           => $this->adminList(),
            $method === 'POST'   && $id === null                           => $this->store(),
            $method === 'PUT'    && $id !== null && $action === null        => $this->update($id),
            $method === 'DELETE' && $id !== null                           => $this->destroy($id),
            $method === 'PATCH'  && $id !== null && $action === 'toggle'    => $this->toggleActivo($id),
            $method === 'PATCH'  && $action === 'orden'                     => $this->updateOrden(),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    private function publicList(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, titulo, subtitulo, imagen, enlace, orden
            FROM   banners
            WHERE  activo = 1
            ORDER  BY orden ASC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function adminList(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM banners ORDER BY orden ASC");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function store(): void
    {
        if (empty($_FILES['imagen']['name'])) {
            $this->error('La imagen es obligatoria', 422); return;
        }

        $imagenNombre = $this->uploadImage($_FILES['imagen']);
        if ($imagenNombre === false) {
            $this->error('Error al subir imagen. Formato no permitido o mayor a 2MB.', 422); return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO banners (titulo, subtitulo, imagen, enlace, orden, activo, created_at)
            VALUES (:titulo, :subtitulo, :imagen, :enlace, :orden, 1, NOW())
        ");
        $stmt->execute([
            ':titulo'    => $this->clean($_POST['titulo']    ?? ''),
            ':subtitulo' => $this->clean($_POST['subtitulo'] ?? ''),
            ':imagen'    => $imagenNombre,
            ':enlace'    => $this->clean($_POST['enlace']    ?? ''),
            ':orden'     => (int)($_POST['orden'] ?? 0),
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('banner_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Banner creado correctamente', 'id' => $newId], 201);
    }

    private function update(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Banner no encontrado', 404); return; }

        $imagenNombre = $existing['imagen'];
        if (!empty($_FILES['imagen']['name'])) {
            $nueva = $this->uploadImage($_FILES['imagen']);
            if ($nueva === false) { $this->error('Error al subir imagen.', 422); return; }
            $this->deleteFile($existing['imagen']);
            $imagenNombre = $nueva;
        }

        $stmt = $this->db->prepare("
            UPDATE banners SET
                titulo    = :titulo,
                subtitulo = :subtitulo,
                imagen    = :imagen,
                enlace    = :enlace,
                orden     = :orden
            WHERE id = :id
        ");
        $stmt->execute([
            ':titulo'    => $this->clean($_POST['titulo']    ?? $existing['titulo'] ?? ''),
            ':subtitulo' => $this->clean($_POST['subtitulo'] ?? $existing['subtitulo'] ?? ''),
            ':imagen'    => $imagenNombre,
            ':enlace'    => $this->clean($_POST['enlace']    ?? $existing['enlace'] ?? ''),
            ':orden'     => (int)($_POST['orden'] ?? $existing['orden']),
            ':id'        => $id,
        ]);

        Security::logSecurityEvent('banner_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Banner actualizado correctamente']);
    }

    private function destroy(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Banner no encontrado', 404); return; }

        $this->deleteFile($existing['imagen']);
        $this->db->prepare("DELETE FROM banners WHERE id = :id")->execute([':id' => $id]);

        Security::logSecurityEvent('banner_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Banner eliminado correctamente']);
    }

    private function toggleActivo(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Banner no encontrado', 404); return; }

        $nuevo = $existing['activo'] ? 0 : 1;
        $this->db->prepare("UPDATE banners SET activo = :a WHERE id = :id")
            ->execute([':a' => $nuevo, ':id' => $id]);

        $this->success(['message' => $nuevo ? 'Activado' : 'Desactivado', 'activo' => (bool)$nuevo]);
    }

    private function updateOrden(): void
    {
        $body  = file_get_contents('php://input');
        $data  = json_decode($body, true);
        $items = $data['banners'] ?? $data ?? [];

        if (!is_array($items)) { $this->error('Datos inválidos', 422); return; }

        $stmt = $this->db->prepare("UPDATE banners SET orden = :orden WHERE id = :id");
        foreach ($items as $item) {
            if (isset($item['id'], $item['orden'])) {
                $stmt->execute([':orden' => (int)$item['orden'], ':id' => (int)$item['id']]);
            }
        }

        $this->success(['message' => 'Orden actualizado correctamente']);
    }

    private function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM banners WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function formatRow(array $row): array
    {
        $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base  = "{$proto}://{$host}/public/uploads/banners/";

        $row['id']     = (int)$row['id'];
        $row['orden']  = (int)$row['orden'];
        $row['activo'] = isset($row['activo']) ? (bool)$row['activo'] : true;

        if ($row['imagen'] && !str_starts_with($row['imagen'], 'http')) {
            $row['imagen_url'] = $base . $row['imagen'];
            $row['imagen']     = $row['imagen_url'];
        } else {
            $row['imagen_url'] = $row['imagen'];
        }

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

        $ext    = $this->allowedMime[$mime];
        $nombre = bin2hex(random_bytes(16)) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
    }

    private function deleteFile(string $nombre): void
    {
        if (!$nombre) return;
        $path = $this->uploadDir . $nombre;
        if (file_exists($path)) @unlink($path);
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
        $r = ['success' => false, 'error' => $message];
        if ($errors) $r['errors'] = $errors;
        echo json_encode($r, JSON_UNESCAPED_UNICODE);
        exit();
    }
}
