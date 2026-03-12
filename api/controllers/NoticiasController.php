<?php
/**
 * NoticiasController.php
 * Ubicación: api/controllers/NoticiasController.php
 *n/noticias       → handle(segments, authUser)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class NoticiasController
{
    private PDO   $db;
    private array $authUser = [];

    /* Directorio físico para subir imágenes en cPanel */
    private string $uploadDir;
    /* URL pública para devolver en las respuestas */
    private string $uploadUrl;

    /* MIME permitidos → extensión */
    private array $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    public function __construct()
    {
        $this->db = (new Database())->getConnection();

        // Ajusta la ruta física según tu estructura en cPanel
        // Normalmente: /home/usuario/public_html/public/uploads/noticias/
        $this->uploadDir = __DIR__ . '/../../public/uploads/noticias/';

        $proto           = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host            = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $this->uploadUrl = "{$proto}://{$host}/public/uploads/noticias/";
    }

    /* ══════════════════════════════════════════════════════════
       ROUTER PÚBLICO
    ══════════════════════════════════════════════════════════ */
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

    /* ══════════════════════════════════════════════════════════
       ROUTER ADMIN
    ══════════════════════════════════════════════════════════ */
    public function handle(array $segments, array $authUser): void
    {
        // Normalizar ID: Auth::verify() puede devolver 'id' o 'userId'
        $authUser['userId'] = $authUser['userId'] ?? $authUser['id'] ?? 0;
        $this->authUser     = $authUser;

        $method = $_SERVER['REQUEST_METHOD'];

        // PHP method spoofing: POST con _method=PUT (viene del noticiasService)
        if (isset($_POST['_method']) && $_POST['_method'] === 'PUT' && $method === 'POST') {
            $method = 'PUT';
        }

        $id     = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;
        $action = $segments[2] ?? null; // 'destacar'

        match (true) {
            $method === 'GET'    && $id === null                           => $this->adminList(),
            $method === 'GET'    && $id !== null                           => $this->adminShow($id),
            $method === 'POST'   && $id === null                           => $this->store(),
            $method === 'PUT'    && $id !== null && $action === null        => $this->update($id),
            $method === 'DELETE' && $id !== null                           => $this->destroy($id),
            $method === 'PATCH'  && $id !== null && $action === 'destacar'  => $this->toggleDestacada($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══════════════════════════════════════════════════════════
       GET /api/noticias — lista pública (solo activas)
    ══════════════════════════════════════════════════════════ */
    private function publicList(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, titulo, descripcion, contenido, imagen,
                   categoria, autor, autor_id, fecha, destacada,
                   created_at, updated_at
            FROM   noticias
            WHERE  activa = 1
            ORDER  BY destacada DESC, fecha DESC
            LIMIT  50
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    /* ══════════════════════════════════════════════════════════
       GET /api/noticias/{id} — pública
    ══════════════════════════════════════════════════════════ */
    private function publicShow(int $id): void
    {
        $row = $this->findById($id, onlyActive: true);
        if (!$row) { $this->error('Noticia no encontrada', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* ══════════════════════════════════════════════════════════
       GET /api/admin/noticias — todas (admin)
    ══════════════════════════════════════════════════════════ */
    private function adminList(): void
    {
        // Filtros opcionales por querystring
        $conditions = [];
        $params     = [];

        // ?q=texto — búsqueda en título y descripción
        if (!empty($_GET['q'])) {
            $q = trim($_GET['q']);

            // Validar longitud máxima (prevenir DoS)
            if (strlen($q) > 100) {
                $this->error('Parámetro de búsqueda muy largo (máximo 100 caracteres)', 422);
                return;
            }

            $q = '%' . $q . '%';
            $conditions[] = '(n.titulo LIKE :q1 OR n.descripcion LIKE :q2)';
            $params[':q1'] = $q;
            $params[':q2'] = $q;
        }

        // ?categoria=Académico
        if (!empty($_GET['categoria'])) {
            $conditions[] = 'n.categoria = :cat';
            $params[':cat'] = $_GET['categoria'];
        }

        // ?destacada=1|0
        if (isset($_GET['destacada']) && in_array($_GET['destacada'], ['0','1'], true)) {
            $conditions[] = 'n.destacada = :dest';
            $params[':dest'] = (int)$_GET['destacada'];
        }

        // Siempre filtrar por activa = 1 (no mostrar soft-deleted en admin)
        $conditions[] = 'n.activa = 1';
        $where = 'WHERE ' . implode(' AND ', $conditions);

        $stmt = $this->db->prepare("
            SELECT n.id, n.titulo, n.descripcion, n.contenido, n.imagen,
                   n.categoria, n.autor, n.autor_id, n.fecha, n.destacada,
                   n.activa, n.created_at, n.updated_at,
                   u.username AS autor_username
            FROM   noticias n
            LEFT   JOIN usuarios u ON n.autor_id = u.id
            $where
            ORDER  BY n.fecha DESC, n.created_at DESC
        ");
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    /* ══════════════════════════════════════════════════════════
       GET /api/admin/noticias/{id}
    ══════════════════════════════════════════════════════════ */
    private function adminShow(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Noticia no encontrada', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* ══════════════════════════════════════════════════════════
       POST /api/admin/noticias — crear
    ══════════════════════════════════════════════════════════ */
    private function store(): void
    {
        $data   = $_POST;
        $errors = $this->validate($data, isUpdate: false);
        if ($errors) { $this->error('Datos inválidos', 422, $errors); return; }

        // Subir imagen si viene
        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name'])) {
            $imagenNombre = $this->uploadImage($_FILES['imagen']);
            if ($imagenNombre === false) {
                $this->error('Error al subir la imagen. Formato no permitido o archivo mayor a 5 MB.', 422);
                return;
            }
        }

        // autor: si viene autor_id, buscar el nombre; si viene autor como texto, usarlo
        $autorId   = !empty($data['autor_id']) ? (int)$data['autor_id'] : ($this->authUser['userId'] ?? null);
        $autorNombre = $this->clean($data['autor'] ?? '');
        if (!$autorNombre && $autorId) {
            $autorNombre = $this->getAutorNombre($autorId);
        }

        $stmt = $this->db->prepare("
            INSERT INTO noticias
                (titulo, descripcion, contenido, imagen, categoria, autor, autor_id,
                 fecha, destacada, activa, created_at, updated_at)
            VALUES
                (:titulo, :descripcion, :contenido, :imagen, :categoria, :autor, :autor_id,
                 :fecha, :destacada, 1, NOW(), NOW())
        ");

        $stmt->execute([
            ':titulo'      => $this->clean($data['titulo']),
            ':descripcion' => $this->clean($data['descripcion'] ?? ''),
            ':contenido'   => $this->clean($data['contenido']   ?? ''),
            ':imagen'      => $imagenNombre,
            ':categoria'   => $this->clean($data['categoria']   ?? ''),
            ':autor'       => $autorNombre,
            ':autor_id'    => $autorId ?: null,
            ':fecha'       => !empty($data['fecha']) ? $data['fecha'] : date('Y-m-d'),
            ':destacada'   => (int)(bool)($data['destacada'] ?? 0),
        ]);

        $newId = (int)$this->db->lastInsertId();

        Security::logSecurityEvent('noticia_created', [
            'by'    => $this->authUser['username'] ?? 'unknown',
            'id'    => $newId,
            'titulo'=> $data['titulo'],
        ]);

        $this->success(['message' => 'Noticia creada correctamente', 'id' => $newId], 201);
    }

    /* ══════════════════════════════════════════════════════════
       PUT /api/admin/noticias/{id} — actualizar
       Llega como POST con _method=PUT (noticiasService)
    ══════════════════════════════════════════════════════════ */
    private function update(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Noticia no encontrada', 404); return; }

        $data   = $_POST;
        $errors = $this->validate($data, isUpdate: true);
        if ($errors) { $this->error('Datos inválidos', 422, $errors); return; }

        // Imagen: nueva si viene, sino mantener la existente
        $imagenNombre = $existing['imagen'];
        if (!empty($_FILES['imagen']['name'])) {
            $nueva = $this->uploadImage($_FILES['imagen']);
            if ($nueva === false) {
                $this->error('Error al subir la imagen.', 422); return;
            }
            // Borrar imagen anterior del servidor
            if ($existing['imagen']) {
                $oldPath = $this->uploadDir . $existing['imagen'];
                if (file_exists($oldPath)) @unlink($oldPath);
            }
            $imagenNombre = $nueva;
        }

        // autor_id y autor
        $autorId     = !empty($data['autor_id']) ? (int)$data['autor_id'] : $existing['autor_id'];
        $autorNombre = $this->clean($data['autor'] ?? $existing['autor'] ?? '');

        $stmt = $this->db->prepare("
            UPDATE noticias SET
                titulo      = :titulo,
                descripcion = :descripcion,
                contenido   = :contenido,
                imagen      = :imagen,
                categoria   = :categoria,
                autor       = :autor,
                autor_id    = :autor_id,
                fecha       = :fecha,
                destacada   = :destacada,
                updated_at  = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':titulo'      => $this->clean($data['titulo']      ?? $existing['titulo']),
            ':descripcion' => $this->clean($data['descripcion'] ?? $existing['descripcion'] ?? ''),
            ':contenido'   => $this->clean($data['contenido']   ?? $existing['contenido']   ?? ''),
            ':imagen'      => $imagenNombre,
            ':categoria'   => $this->clean($data['categoria']   ?? $existing['categoria']   ?? ''),
            ':autor'       => $autorNombre,
            ':autor_id'    => $autorId ?: null,
            ':fecha'       => !empty($data['fecha']) ? $data['fecha'] : ($existing['fecha'] ?? date('Y-m-d')),
            ':destacada'   => (int)(bool)($data['destacada'] ?? $existing['destacada']),
            ':id'          => $id,
        ]);

        Security::logSecurityEvent('noticia_updated', [
            'by' => $this->authUser['username'] ?? 'unknown', 'id' => $id,
        ]);

        $this->success(['message' => 'Noticia actualizada correctamente']);
    }

    /* ══════════════════════════════════════════════════════════
       DELETE /api/admin/noticias/{id} — soft delete
    ══════════════════════════════════════════════════════════ */
    private function destroy(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Noticia no encontrada', 404); return; }

        // Soft delete: activa = 0  ← campo correcto en el schema real
        $this->db->prepare("UPDATE noticias SET activa = 0, updated_at = NOW() WHERE id = :id")
            ->execute([':id' => $id]);

        Security::logSecurityEvent('noticia_deleted', [
            'by' => $this->authUser['username'] ?? 'unknown', 'id' => $id,
        ]);

        $this->success(['message' => 'Noticia eliminada correctamente']);
    }

    /* ══════════════════════════════════════════════════════════
       PATCH /api/admin/noticias/{id}/destacar
    ══════════════════════════════════════════════════════════ */
    private function toggleDestacada(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Noticia no encontrada', 404); return; }

        $nuevo = $existing['destacada'] ? 0 : 1;

        $this->db->prepare("UPDATE noticias SET destacada = :d, updated_at = NOW() WHERE id = :id")
            ->execute([':d' => $nuevo, ':id' => $id]);

        $this->success([
            'message'   => $nuevo ? 'Noticia marcada como destacada' : 'Noticia desmarcada',
            'destacada' => (bool)$nuevo,
        ]);
    }

    /* ══════════════════════════════════════════════════════════
       UPLOAD DE IMAGEN
    ══════════════════════════════════════════════════════════ */
    private function uploadImage(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK)         return false;
        if ($file['size']  >  5 * 1024 * 1024)        return false;

        // Verificar MIME real (no solo extensión declarada por el cliente)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, $this->allowedMime)) return false;

        // Crear directorio si no existe
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }

        // Nombre aleatorio + extensión real
        $ext     = $this->allowedMime[$mime];
        $nombre  = bin2hex(random_bytes(16)) . '.' . $ext;
        $destino = $this->uploadDir . $nombre;

        if (!move_uploaded_file($file['tmp_name'], $destino)) return false;

        return $nombre;
    }

    /* ══════════════════════════════════════════════════════════
       HELPERS
    ══════════════════════════════════════════════════════════ */

    /** Buscar por ID. $onlyActive = true para ruta pública */
    private function findById(int $id, bool $onlyActive = false): ?array
    {
        $cond = $onlyActive ? 'AND activa = 1' : '';
        $stmt = $this->db->prepare("
            SELECT n.*, u.username AS autor_username
            FROM   noticias n
            LEFT   JOIN usuarios u ON n.autor_id = u.id
            WHERE  n.id = :id $cond
            LIMIT  1
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Obtener nombre del autor desde la tabla usuarios */
    private function getAutorNombre(int $userId): string
    {
        $stmt = $this->db->prepare("SELECT username FROM usuarios WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        return $stmt->fetchColumn() ?: '';
    }

    /** Normalizar fila para la respuesta JSON */
    private function formatRow(array $row): array
    {
        $row['id']        = (int)  $row['id'];
        $row['destacada'] = (bool) $row['destacada'];
        $row['activa']    = isset($row['activa']) ? (bool)$row['activa'] : true;
        $row['autor_id']  = isset($row['autor_id']) ? (int)$row['autor_id'] : null;

        // URL completa de la imagen
        $row['imagen_url'] = $row['imagen']
            ? $this->uploadUrl . $row['imagen']
            : null;

        return $row;
    }

    private function clean(string $v): string
    {
        return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validación de campos
     * La validación es laxa en update (solo valida lo que llega)
     */
    private function validate(array $d, bool $isUpdate): array
    {
        $errors = [];

        // título requerido en creación
        if (!$isUpdate && empty(trim($d['titulo'] ?? ''))) {
            $errors[] = 'El título es requerido';
        }
        // contenido requerido en creación (NOT NULL en BD)
        if (!$isUpdate && !isset($d['contenido'])) {
            // Permitir string vacío, solo bloqueamos si no viene la key en creación
        }
        if (!empty($d['titulo']) && mb_strlen($d['titulo']) > 200) {
            $errors[] = 'El título no puede superar 200 caracteres';
        }
        if (!empty($d['categoria']) && mb_strlen($d['categoria']) > 50) {
            $errors[] = 'La categoría no puede superar 50 caracteres';
        }
        if (!empty($d['fecha'])) {
            // Validar formato y que sea una fecha actual (YYYY-MM-DD)
            $dateObj = DateTime::createFromFormat('Y-m-d', $d['fecha']);
            if (!$dateObj || $dateObj->format('Y-m-d') !== $d['fecha']) {
                $errors[] = 'Formato de fecha inválido o fecha inexistente (YYYY-MM-DD)';
            }
        }

        return $errors;
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