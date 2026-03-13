<?php
/**
 * ComunicadosController.php
 * Gestión de comunicados institucionales
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class ComunicadosController
{
    private PDO   $db;
    private array $authUser = [];

    private string $uploadDir;
    private string $uploadUrl;

    private array $allowedImageMime = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    public function __construct()
    {
        $this->db        = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/comunicados/';
        $proto           = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host            = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $this->uploadUrl = "{$proto}://{$host}/public/uploads/comunicados/";
    }

    /* ══════════════════════════════════════════════════
       ROUTER PÚBLICO
    ══════════════════════════════════════════════════ */
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

    /* ══════════════════════════════════════════════════
       ROUTER ADMIN
    ══════════════════════════════════════════════════ */
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
            $method === 'GET'    && $id !== null                           => $this->adminShow($id),
            $method === 'POST'   && $id === null                           => $this->store(),
            $method === 'PUT'    && $id !== null && $action === null        => $this->update($id),
            $method === 'DELETE' && $id !== null                           => $this->destroy($id),
            $method === 'PATCH'  && $id !== null && $action === 'destacar'  => $this->toggleDestacado($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══════════════════════════════════════════════════
       GET /api/comunicados — lista pública
    ══════════════════════════════════════════════════ */
    private function publicList(): void
    {
        $tipo = $_GET['tipo'] ?? null;
        $where = 'WHERE activo = 1';
        $params = [];

        if ($tipo && in_array($tipo, ['Académico', 'Administrativo', 'General'])) {
            $where .= ' AND tipo = :tipo';
            $params[':tipo'] = $tipo;
        }

        $stmt = $this->db->prepare("
            SELECT id, titulo, contenido, archivo_pdf, imagen,
                   fecha_publicacion, tipo, destacado, created_at
            FROM   comunicados
            $where
            ORDER  BY destacado DESC, fecha_publicacion DESC
            LIMIT  50
        ");
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function publicShow(int $id): void
    {
        $row = $this->findById($id, onlyActive: true);
        if (!$row) { $this->error('Comunicado no encontrado', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* ══════════════════════════════════════════════════
       ADMIN LIST
    ══════════════════════════════════════════════════ */
    private function adminList(): void
    {
        $conditions = ['activo = 1'];
        $params     = [];

        if (!empty($_GET['q'])) {
            $q = '%' . trim($_GET['q']) . '%';
            $conditions[] = '(titulo LIKE :q1 OR contenido LIKE :q2)';
            $params[':q1'] = $q;
            $params[':q2'] = $q;
        }
        if (!empty($_GET['tipo'])) {
            $conditions[] = 'tipo = :tipo';
            $params[':tipo'] = $_GET['tipo'];
        }

        $where = 'WHERE ' . implode(' AND ', $conditions);

        $stmt = $this->db->prepare("
            SELECT id, titulo, contenido, archivo_pdf, imagen,
                   fecha_publicacion, tipo, destacado, activo, created_at, updated_at
            FROM   comunicados
            $where
            ORDER  BY fecha_publicacion DESC, created_at DESC
        ");
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function adminShow(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Comunicado no encontrado', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* ══════════════════════════════════════════════════
       POST — crear
    ══════════════════════════════════════════════════ */
    private function store(): void
    {
        if (empty(trim($_POST['titulo'] ?? ''))) {
            $this->error('El título es requerido', 422); return;
        }
        if (empty(trim($_POST['contenido'] ?? ''))) {
            $this->error('El contenido es requerido', 422); return;
        }

        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name'])) {
            $imagenNombre = $this->uploadImage($_FILES['imagen']);
            if ($imagenNombre === false) {
                $this->error('Error al subir imagen. Formato no permitido o mayor a 2MB.', 422); return;
            }
        }

        $pdfNombre = null;
        if (!empty($_FILES['archivo_pdf']['name'])) {
            $pdfNombre = $this->uploadPDF($_FILES['archivo_pdf']);
            if ($pdfNombre === false) {
                $this->error('Error al subir PDF. Solo archivos PDF hasta 5MB.', 422); return;
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO comunicados
                (titulo, contenido, archivo_pdf, imagen, fecha_publicacion, tipo, destacado, activo, created_at, updated_at)
            VALUES
                (:titulo, :contenido, :archivo_pdf, :imagen, :fecha, :tipo, :destacado, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ':titulo'      => $this->clean($_POST['titulo']),
            ':contenido'   => $this->clean($_POST['contenido']),
            ':archivo_pdf' => $pdfNombre,
            ':imagen'      => $imagenNombre,
            ':fecha'       => $_POST['fecha_publicacion'] ?? date('Y-m-d'),
            ':tipo'        => $_POST['tipo'] ?? 'General',
            ':destacado'   => (int)(bool)($_POST['destacado'] ?? 0),
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('comunicado_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Comunicado creado correctamente', 'id' => $newId], 201);
    }

    /* ══════════════════════════════════════════════════
       PUT — actualizar
    ══════════════════════════════════════════════════ */
    private function update(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Comunicado no encontrado', 404); return; }

        $imagenNombre = $existing['imagen'];
        if (!empty($_FILES['imagen']['name'])) {
            $nueva = $this->uploadImage($_FILES['imagen']);
            if ($nueva === false) { $this->error('Error al subir imagen.', 422); return; }
            if ($existing['imagen']) $this->deleteFile('comunicados', $existing['imagen']);
            $imagenNombre = $nueva;
        }

        $pdfNombre = $existing['archivo_pdf'];
        if (!empty($_FILES['archivo_pdf']['name'])) {
            $nuevoPDF = $this->uploadPDF($_FILES['archivo_pdf']);
            if ($nuevoPDF === false) { $this->error('Error al subir PDF.', 422); return; }
            if ($existing['archivo_pdf']) $this->deleteFile('comunicados', $existing['archivo_pdf']);
            $pdfNombre = $nuevoPDF;
        }

        $stmt = $this->db->prepare("
            UPDATE comunicados SET
                titulo           = :titulo,
                contenido        = :contenido,
                archivo_pdf      = :archivo_pdf,
                imagen           = :imagen,
                fecha_publicacion = :fecha,
                tipo             = :tipo,
                destacado        = :destacado,
                updated_at       = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':titulo'      => $this->clean($_POST['titulo']    ?? $existing['titulo']),
            ':contenido'   => $this->clean($_POST['contenido'] ?? $existing['contenido']),
            ':archivo_pdf' => $pdfNombre,
            ':imagen'      => $imagenNombre,
            ':fecha'       => $_POST['fecha_publicacion'] ?? $existing['fecha_publicacion'],
            ':tipo'        => $_POST['tipo']              ?? $existing['tipo'],
            ':destacado'   => (int)(bool)($_POST['destacado']  ?? $existing['destacado']),
            ':id'          => $id,
        ]);

        Security::logSecurityEvent('comunicado_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Comunicado actualizado correctamente']);
    }

    /* ══════════════════════════════════════════════════
       DELETE — eliminar (soft delete)
    ══════════════════════════════════════════════════ */
    private function destroy(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Comunicado no encontrado', 404); return; }

        $this->db->prepare("UPDATE comunicados SET activo = 0, updated_at = NOW() WHERE id = :id")
            ->execute([':id' => $id]);

        Security::logSecurityEvent('comunicado_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Comunicado eliminado correctamente']);
    }

    /* ══════════════════════════════════════════════════
       PATCH — toggle destacado
    ══════════════════════════════════════════════════ */
    private function toggleDestacado(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Comunicado no encontrado', 404); return; }

        $nuevo = $existing['destacado'] ? 0 : 1;
        $this->db->prepare("UPDATE comunicados SET destacado = :d, updated_at = NOW() WHERE id = :id")
            ->execute([':d' => $nuevo, ':id' => $id]);

        $this->success(['message' => $nuevo ? 'Marcado como destacado' : 'Desmarcado', 'destacado' => (bool)$nuevo]);
    }

    /* ══════════════════════════════════════════════════
       HELPERS
    ══════════════════════════════════════════════════ */
    private function findById(int $id, bool $onlyActive = false): ?array
    {
        $cond = $onlyActive ? 'AND activo = 1' : '';
        $stmt = $this->db->prepare("SELECT * FROM comunicados WHERE id = :id $cond LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function formatRow(array $row): array
    {
        $proto  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base   = "{$proto}://{$host}/public/uploads/comunicados/";

        $row['id']        = (int)$row['id'];
        $row['destacado'] = (bool)$row['destacado'];
        $row['activo']    = isset($row['activo']) ? (bool)$row['activo'] : true;
        $row['imagen']    = $row['imagen']      ? $base . $row['imagen']      : null;
        $row['archivo_pdf'] = $row['archivo_pdf'] ? $base . $row['archivo_pdf'] : null;
        return $row;
    }

    private function uploadImage(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  2 * 1024 * 1024) return false;

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, $this->allowedImageMime)) return false;

        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);

        $ext     = $this->allowedImageMime[$mime];
        $nombre  = bin2hex(random_bytes(16)) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
    }

    private function uploadPDF(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  5 * 1024 * 1024) return false;

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if ($mime !== 'application/pdf') return false;

        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);

        $nombre = bin2hex(random_bytes(16)) . '.pdf';
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
    }

    private function deleteFile(string $tipo, string $nombre): void
    {
        $path = __DIR__ . "/../../public/uploads/{$tipo}/{$nombre}";
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
