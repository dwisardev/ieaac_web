<?php
/**
 * DocumentosController.php
 * Gestión de documentos de gestión institucional + información institucional
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class DocumentosController
{
    private PDO   $db;
    private array $authUser = [];

    private string $uploadDir;

    private array $allowedMime = [
        'application/pdf'                                                          => 'pdf',
        'application/msword'                                                       => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  => 'docx',
        'application/vnd.ms-excel'                                                 => 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'        => 'xlsx',
        'application/vnd.ms-powerpoint'                                            => 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'=> 'pptx',
    ];

    private array $tiposMime = [
        'pdf'  => 'PDF',
        'doc'  => 'WORD',
        'docx' => 'WORD',
        'xls'  => 'EXCEL',
        'xlsx' => 'EXCEL',
        'ppt'  => 'POWERPOINT',
        'pptx' => 'POWERPOINT',
    ];

    public function __construct()
    {
        $this->db        = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/documentos/';
    }

    /* ROUTER PÚBLICO */
    public function handlePublic(array $segments): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $sub    = $segments[1] ?? null; // info | null

        match (true) {
            $method === 'GET' && $sub === 'info'    => $this->publicInfo(),
            $method === 'GET'                        => $this->publicList(),
            $method === 'PATCH' && is_numeric($sub) => $this->registrarVista((int)$sub),
            default => $this->error('Método no permitido', 405),
        };
    }

    /* ROUTER ADMIN */
    public function handle(array $segments, array $authUser): void
    {
        $authUser['userId'] = $authUser['userId'] ?? $authUser['id'] ?? 0;
        $this->authUser     = $authUser;

        $method = $_SERVER['REQUEST_METHOD'];
        if (isset($_POST['_method']) && $method === 'POST') {
            $method = strtoupper($_POST['_method']);
        }

        $sub = $segments[1] ?? null;
        $id  = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : null;
        // También aceptar /admin/documentos/{id} (sin sub)
        if ($sub !== 'info' && $sub !== 'estadisticas' && is_numeric($sub)) {
            $id  = (int)$sub;
            $sub = null;
        }

        match (true) {
            // Info institucional
            $method === 'GET' && $sub === 'info'                          => $this->adminGetInfo(),
            $method === 'PUT' && $sub === 'info'                          => $this->adminUpdateInfo(),
            // Estadísticas
            $method === 'GET' && $sub === 'estadisticas'                   => $this->adminEstadisticas(),
            // CRUD documentos
            $method === 'GET'    && $id === null                           => $this->adminList(),
            $method === 'POST'   && $id === null                           => $this->store(),
            $method === 'PUT'    && $id !== null                           => $this->update($id),
            $method === 'DELETE' && $id !== null                           => $this->destroy($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══ PÚBLICO ══ */
    private function publicList(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, codigo, nombre, descripcion, archivo, color, icono,
                   anio_vigencia, orden, descargas, vistas
            FROM   documentos_gestion
            WHERE  activo = 1
            ORDER  BY orden ASC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatDoc'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function publicInfo(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, nombre, codigo_modular, director, ubicacion, telefono, email,
                   anio_vigencia, grados_atendidos, nivel_educativo, tipo_gestion
            FROM   informacion_institucional
            WHERE  activo = 1
            LIMIT  1
        ");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->success(['data' => $row ?: null]);
    }

    private function registrarVista(int $id): void
    {
        $this->db->prepare("UPDATE documentos_gestion SET vistas = vistas + 1 WHERE id = :id")
            ->execute([':id' => $id]);
        $this->success(['message' => 'Vista registrada']);
    }

    /* ══ ADMIN ══ */
    private function adminList(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM documentos_gestion ORDER BY orden ASC");
        $stmt->execute();
        $rows = array_map([$this, 'formatDoc'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function adminGetInfo(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM informacion_institucional WHERE activo = 1 LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->success(['data' => $row ?: null]);
    }

    private function adminUpdateInfo(): void
    {
        $data = $this->parseBody();

        $stmt = $this->db->prepare("SELECT id FROM informacion_institucional LIMIT 1");
        $stmt->execute();
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE informacion_institucional SET
                    nombre           = :nombre,
                    codigo_modular   = :codigo,
                    director         = :director,
                    ubicacion        = :ubicacion,
                    telefono         = :telefono,
                    email            = :email,
                    anio_vigencia    = :anio,
                    grados_atendidos = :grados,
                    updated_at       = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':nombre'    => $this->clean($data['nombre']           ?? ''),
                ':codigo'    => $this->clean($data['codigo_modular']   ?? ''),
                ':director'  => $this->clean($data['director']         ?? ''),
                ':ubicacion' => $this->clean($data['ubicacion']        ?? ''),
                ':telefono'  => $this->clean($data['telefono']         ?? ''),
                ':email'     => $this->clean($data['email']            ?? ''),
                ':anio'      => (int)($data['anio_vigencia']           ?? date('Y')),
                ':grados'    => $this->clean($data['grados_atendidos'] ?? ''),
                ':id'        => $existing['id'],
            ]);
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO informacion_institucional
                    (nombre, codigo_modular, director, ubicacion, telefono, email, anio_vigencia, grados_atendidos, activo, updated_at)
                VALUES
                    (:nombre, :codigo, :director, :ubicacion, :telefono, :email, :anio, :grados, 1, NOW())
            ");
            $stmt->execute([
                ':nombre'    => $this->clean($data['nombre']           ?? ''),
                ':codigo'    => $this->clean($data['codigo_modular']   ?? ''),
                ':director'  => $this->clean($data['director']         ?? ''),
                ':ubicacion' => $this->clean($data['ubicacion']        ?? ''),
                ':telefono'  => $this->clean($data['telefono']         ?? ''),
                ':email'     => $this->clean($data['email']            ?? ''),
                ':anio'      => (int)($data['anio_vigencia']           ?? date('Y')),
                ':grados'    => $this->clean($data['grados_atendidos'] ?? ''),
            ]);
        }

        Security::logSecurityEvent('info_institucional_updated', ['by' => $this->authUser['username'] ?? 'unknown']);
        $this->success(['message' => 'Información institucional actualizada correctamente']);
    }

    private function adminEstadisticas(): void
    {
        $total     = $this->db->query("SELECT COUNT(*) FROM documentos_gestion WHERE activo = 1")->fetchColumn();
        $descargas = $this->db->query("SELECT SUM(descargas) FROM documentos_gestion")->fetchColumn();
        $vistas    = $this->db->query("SELECT SUM(vistas) FROM documentos_gestion")->fetchColumn();

        $stmt = $this->db->query("
            SELECT archivo,
                   CASE
                       WHEN archivo LIKE '%.pdf'  THEN 'PDF'
                       WHEN archivo LIKE '%.docx' THEN 'WORD'
                       WHEN archivo LIKE '%.doc'  THEN 'WORD'
                       WHEN archivo LIKE '%.xlsx' THEN 'EXCEL'
                       WHEN archivo LIKE '%.xls'  THEN 'EXCEL'
                       ELSE 'OTRO'
                   END AS tipo,
                   COUNT(*) AS cantidad
            FROM documentos_gestion
            WHERE activo = 1
            GROUP BY tipo
        ");
        $porTipo = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $porTipo[$row['tipo']] = (int)$row['cantidad'];
        }

        $this->success(['data' => [
            'totalDocumentos'  => (int)$total,
            'totalDescargas'   => (int)$descargas,
            'totalVistas'      => (int)$vistas,
            'documentosPorTipo'=> $porTipo,
        ]]);
    }

    private function store(): void
    {
        if (empty(trim($_POST['nombre'] ?? ''))) {
            $this->error('El nombre es requerido', 422); return;
        }
        if (empty($_FILES['archivo']['name'])) {
            $this->error('El archivo es requerido', 422); return;
        }

        $upload = $this->uploadDocumento($_FILES['archivo']);
        if ($upload === false) {
            $this->error('Error al subir el archivo. Formatos soportados: PDF, Word, Excel, PowerPoint. Máx 10MB.', 422); return;
        }

        $etiquetas = json_decode($_POST['etiquetas'] ?? '[]', true) ?? [];

        $stmt = $this->db->prepare("
            INSERT INTO documentos_gestion
                (codigo, nombre, descripcion, archivo, color, icono, anio_vigencia, orden, activo, created_at, updated_at)
            VALUES
                (:codigo, :nombre, :descripcion, :archivo, :color, :icono, :anio, :orden, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ':codigo'      => $this->clean($_POST['codigo']       ?? ''),
            ':nombre'      => $this->clean($_POST['nombre']),
            ':descripcion' => $this->clean($_POST['descripcion']  ?? ''),
            ':archivo'     => $upload,
            ':color'       => $this->clean($_POST['color']        ?? '#4361ee'),
            ':icono'       => $this->clean($_POST['icono']        ?? 'FileText'),
            ':anio'        => (int)($_POST['anio_vigencia']       ?? date('Y')),
            ':orden'       => (int)($_POST['orden']               ?? 0),
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('documento_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Documento creado correctamente', 'id' => $newId], 201);
    }

    private function update(int $id): void
    {
        $stmt = $this->db->prepare("SELECT * FROM documentos_gestion WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Documento no encontrado', 404); return; }

        $archivoNombre = $existing['archivo'];
        if (!empty($_FILES['archivo']['name'])) {
            $upload = $this->uploadDocumento($_FILES['archivo']);
            if ($upload === false) { $this->error('Error al subir el archivo.', 422); return; }
            $this->deleteUpload($existing['archivo']);
            $archivoNombre = $upload;
        }

        $stmt = $this->db->prepare("
            UPDATE documentos_gestion SET
                codigo       = :codigo,
                nombre       = :nombre,
                descripcion  = :descripcion,
                archivo      = :archivo,
                color        = :color,
                icono        = :icono,
                anio_vigencia = :anio,
                orden        = :orden,
                updated_at   = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':codigo'      => $this->clean($_POST['codigo']       ?? $existing['codigo']),
            ':nombre'      => $this->clean($_POST['nombre']       ?? $existing['nombre']),
            ':descripcion' => $this->clean($_POST['descripcion']  ?? $existing['descripcion'] ?? ''),
            ':archivo'     => $archivoNombre,
            ':color'       => $this->clean($_POST['color']        ?? $existing['color']       ?? '#4361ee'),
            ':icono'       => $this->clean($_POST['icono']        ?? $existing['icono']       ?? 'FileText'),
            ':anio'        => (int)($_POST['anio_vigencia']       ?? $existing['anio_vigencia']),
            ':orden'       => (int)($_POST['orden']               ?? $existing['orden']),
            ':id'          => $id,
        ]);

        Security::logSecurityEvent('documento_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Documento actualizado correctamente']);
    }

    private function destroy(int $id): void
    {
        $stmt = $this->db->prepare("SELECT archivo FROM documentos_gestion WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Documento no encontrado', 404); return; }

        $this->deleteUpload($existing['archivo']);
        $this->db->prepare("DELETE FROM documentos_gestion WHERE id = :id")->execute([':id' => $id]);

        Security::logSecurityEvent('documento_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Documento eliminado correctamente']);
    }

    /* ══ HELPERS ══ */
    private function formatDoc(array $row): array
    {
        $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base  = "{$proto}://{$host}/public/uploads/documentos/";

        $row['id']        = (int)$row['id'];
        $row['orden']     = (int)$row['orden'];
        $row['descargas'] = (int)($row['descargas'] ?? 0);
        $row['vistas']    = (int)($row['vistas']    ?? 0);
        $row['activo']    = isset($row['activo'])    ? (bool)$row['activo'] : true;

        // Determinar tipo
        $ext = strtolower(pathinfo($row['archivo'] ?? '', PATHINFO_EXTENSION));
        $row['tipo_archivo'] = $this->tiposMime[$ext] ?? 'DESCONOCIDO';

        if ($row['archivo'] && !str_starts_with($row['archivo'], 'http')) {
            $row['archivo'] = $base . $row['archivo'];
        }

        return $row;
    }

    private function uploadDocumento(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  10 * 1024 * 1024) return false;

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

    private function deleteUpload(string $nombre): void
    {
        if (!$nombre) return;
        $path = $this->uploadDir . basename($nombre);
        if (file_exists($path)) @unlink($path);
    }

    private function parseBody(): array
    {
        $ct = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($ct, 'application/json')) {
            return json_decode(file_get_contents('php://input'), true) ?? [];
        }
        return $_POST;
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
