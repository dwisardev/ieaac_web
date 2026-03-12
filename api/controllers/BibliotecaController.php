<?php
/**
 * BibliotecaController.php
 * Gestión de biblioteca virtual: libros y categorías
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class BibliotecaController
{
    private PDO   $db;
    private array $authUser = [];

    private string $uploadDir;

    public function __construct()
    {
        $this->db        = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/biblioteca/';
    }

    /* ROUTER PÚBLICO */
    public function handlePublic(array $segments): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $sub    = $segments[1] ?? null; // libros | categorias
        $id     = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : null;

        match (true) {
            $method === 'GET' && $sub === 'categorias'                    => $this->publicCategorias(),
            $method === 'GET' && $sub === 'estadisticas'                   => $this->publicEstadisticas(),
            $method === 'GET' && ($sub === null || $sub === 'libros') && $id === null => $this->publicListLibros(),
            $method === 'GET' && is_numeric($sub)                          => $this->publicShowLibro((int)$sub),
            $method === 'PATCH' && is_numeric($sub) && $segments[2] === 'descargar' => $this->registrarDescarga((int)$sub),
            default => $this->error('Ruta no encontrada', 404),
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

        $sub    = $segments[1] ?? null;
        $id     = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : null;

        match (true) {
            // Libros
            $method === 'GET'    && ($sub === null || $sub === 'libros') && $id === null => $this->adminListLibros(),
            $method === 'POST'   && ($sub === null || $sub === 'libros') && $id === null => $this->storeLibro(),
            $method === 'PUT'    && $sub === 'libros' && $id !== null                    => $this->updateLibro($id),
            $method === 'DELETE' && $sub === 'libros' && $id !== null                    => $this->destroyLibro($id),
            // Categorías
            $method === 'GET'    && $sub === 'categorias'                                => $this->adminListCategorias(),
            $method === 'POST'   && $sub === 'categorias'                                => $this->storeCategoria(),
            $method === 'PUT'    && $sub === 'categorias' && $id !== null                => $this->updateCategoria($id),
            $method === 'DELETE' && $sub === 'categorias' && $id !== null                => $this->destroyCategoria($id),
            // Estadísticas
            $method === 'GET'    && $sub === 'estadisticas'                              => $this->adminEstadisticas(),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══ LIBROS — PÚBLICO ══ */
    private function publicListLibros(): void
    {
        $cat = $_GET['categoria_id'] ?? null;
        $q   = $_GET['q'] ?? null;

        $conditions = ['bl.activo = 1'];
        $params     = [];

        if ($cat && is_numeric($cat)) {
            $conditions[] = 'bl.categoria_id = :cat';
            $params[':cat'] = (int)$cat;
        }
        if ($q) {
            $conditions[] = '(bl.titulo LIKE :q OR bl.autor LIKE :q2)';
            $params[':q']  = '%' . trim($q) . '%';
            $params[':q2'] = '%' . trim($q) . '%';
        }

        $where = 'WHERE ' . implode(' AND ', $conditions);

        $stmt = $this->db->prepare("
            SELECT bl.id, bl.titulo, bl.autor, bl.editorial, bl.anio_publicacion,
                   bl.descripcion, bl.archivo, bl.miniatura, bl.descargas, bl.vistas,
                   bl.destacado, bl.categoria_id,
                   bc.nombre AS categoria, bc.color AS categoria_color
            FROM   biblioteca_libros bl
            LEFT   JOIN biblioteca_categorias bc ON bl.categoria_id = bc.id
            $where
            ORDER  BY bl.destacado DESC, bl.created_at DESC
            LIMIT  100
        ");
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $rows = array_map([$this, 'formatLibro'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function publicShowLibro(int $id): void
    {
        $stmt = $this->db->prepare("
            SELECT bl.*, bc.nombre AS categoria, bc.color AS categoria_color
            FROM   biblioteca_libros bl
            LEFT   JOIN biblioteca_categorias bc ON bl.categoria_id = bc.id
            WHERE  bl.id = :id AND bl.activo = 1 LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->error('Libro no encontrado', 404); return; }

        // Incrementar vistas
        $this->db->prepare("UPDATE biblioteca_libros SET vistas = vistas + 1 WHERE id = :id")
            ->execute([':id' => $id]);

        $this->success(['data' => $this->formatLibro($row)]);
    }

    private function publicCategorias(): void
    {
        $stmt = $this->db->prepare("
            SELECT bc.*, COUNT(bl.id) AS total_libros
            FROM   biblioteca_categorias bc
            LEFT   JOIN biblioteca_libros bl ON bl.categoria_id = bc.id AND bl.activo = 1
            WHERE  bc.activo = 1
            GROUP  BY bc.id
            ORDER  BY bc.orden ASC
        ");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function publicEstadisticas(): void
    {
        $stats = $this->getEstadisticas();
        $this->success(['data' => $stats]);
    }

    private function registrarDescarga(int $id): void
    {
        $this->db->prepare("UPDATE biblioteca_libros SET descargas = descargas + 1 WHERE id = :id")
            ->execute([':id' => $id]);
        $this->success(['message' => 'Descarga registrada']);
    }

    /* ══ LIBROS — ADMIN ══ */
    private function adminListLibros(): void
    {
        $stmt = $this->db->prepare("
            SELECT bl.*, bc.nombre AS categoria, bc.color AS categoria_color
            FROM   biblioteca_libros bl
            LEFT   JOIN biblioteca_categorias bc ON bl.categoria_id = bc.id
            ORDER  BY bl.created_at DESC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatLibro'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function storeLibro(): void
    {
        if (empty(trim($_POST['titulo'] ?? ''))) {
            $this->error('El título es requerido', 422); return;
        }
        if (empty($_POST['categoria_id'] ?? '')) {
            $this->error('La categoría es requerida', 422); return;
        }
        if (empty($_FILES['archivo_pdf']['name'])) {
            $this->error('El archivo PDF es requerido', 422); return;
        }

        $archivoNombre = $this->uploadPDF($_FILES['archivo_pdf']);
        if ($archivoNombre === false) {
            $this->error('Error al subir PDF. Solo PDF hasta 10MB.', 422); return;
        }

        $miniaturaNombre = null;
        if (!empty($_FILES['miniatura']['name'])) {
            $miniaturaNombre = $this->uploadImagen($_FILES['miniatura']);
        }

        $stmt = $this->db->prepare("
            INSERT INTO biblioteca_libros
                (categoria_id, titulo, autor, editorial, anio_publicacion, descripcion,
                 archivo, miniatura, tamanio_archivo, activo, created_at, updated_at)
            VALUES
                (:categoria_id, :titulo, :autor, :editorial, :anio, :descripcion,
                 :archivo, :miniatura, :tamanio, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ':categoria_id' => (int)$_POST['categoria_id'],
            ':titulo'       => $this->clean($_POST['titulo']),
            ':autor'        => $this->clean($_POST['autor']        ?? ''),
            ':editorial'    => $this->clean($_POST['editorial']    ?? ''),
            ':anio'         => !empty($_POST['anio_publicacion']) ? (int)$_POST['anio_publicacion'] : null,
            ':descripcion'  => $this->clean($_POST['descripcion'] ?? ''),
            ':archivo'      => $archivoNombre,
            ':miniatura'    => $miniaturaNombre,
            ':tamanio'      => $_FILES['archivo_pdf']['size'] ?? 0,
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('libro_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Libro creado correctamente', 'id' => $newId], 201);
    }

    private function updateLibro(int $id): void
    {
        $stmt = $this->db->prepare("SELECT * FROM biblioteca_libros WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Libro no encontrado', 404); return; }

        $archivoNombre = $existing['archivo'];
        if (!empty($_FILES['archivo_pdf']['name'])) {
            $nuevo = $this->uploadPDF($_FILES['archivo_pdf']);
            if ($nuevo === false) { $this->error('Error al subir PDF.', 422); return; }
            $this->deleteUpload($existing['archivo']);
            $archivoNombre = $nuevo;
        }

        $stmt = $this->db->prepare("
            UPDATE biblioteca_libros SET
                categoria_id     = :categoria_id,
                titulo           = :titulo,
                autor            = :autor,
                editorial        = :editorial,
                anio_publicacion = :anio,
                descripcion      = :descripcion,
                archivo          = :archivo,
                updated_at       = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':categoria_id' => (int)($_POST['categoria_id'] ?? $existing['categoria_id']),
            ':titulo'       => $this->clean($_POST['titulo']       ?? $existing['titulo']),
            ':autor'        => $this->clean($_POST['autor']        ?? $existing['autor']        ?? ''),
            ':editorial'    => $this->clean($_POST['editorial']    ?? $existing['editorial']    ?? ''),
            ':anio'         => !empty($_POST['anio_publicacion']) ? (int)$_POST['anio_publicacion'] : $existing['anio_publicacion'],
            ':descripcion'  => $this->clean($_POST['descripcion'] ?? $existing['descripcion']  ?? ''),
            ':archivo'      => $archivoNombre,
            ':id'           => $id,
        ]);

        Security::logSecurityEvent('libro_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Libro actualizado correctamente']);
    }

    private function destroyLibro(int $id): void
    {
        $stmt = $this->db->prepare("SELECT archivo, miniatura FROM biblioteca_libros WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Libro no encontrado', 404); return; }

        $this->deleteUpload($existing['archivo']);
        $this->deleteUpload($existing['miniatura'] ?? '');
        $this->db->prepare("DELETE FROM biblioteca_libros WHERE id = :id")->execute([':id' => $id]);

        Security::logSecurityEvent('libro_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Libro eliminado correctamente']);
    }

    /* ══ CATEGORÍAS — ADMIN ══ */
    private function adminListCategorias(): void
    {
        $stmt = $this->db->prepare("
            SELECT bc.*, COUNT(bl.id) AS total_libros
            FROM   biblioteca_categorias bc
            LEFT   JOIN biblioteca_libros bl ON bl.categoria_id = bc.id AND bl.activo = 1
            GROUP  BY bc.id
            ORDER  BY bc.orden ASC
        ");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function storeCategoria(): void
    {
        $data = $this->parseBody();
        if (empty(trim($data['nombre'] ?? ''))) {
            $this->error('El nombre es requerido', 422); return;
        }

        $slug = $this->slugify($data['nombre']);

        $stmt = $this->db->prepare("
            INSERT INTO biblioteca_categorias (nombre, slug, descripcion, icono, color, orden, activo, created_at, updated_at)
            VALUES (:nombre, :slug, :descripcion, :icono, :color, :orden, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ':nombre'      => $this->clean($data['nombre']),
            ':slug'        => $slug,
            ':descripcion' => $this->clean($data['descripcion'] ?? ''),
            ':icono'       => $this->clean($data['icono']       ?? 'book'),
            ':color'       => $this->clean($data['color']       ?? '#007bff'),
            ':orden'       => (int)($data['orden']              ?? 0),
        ]);

        $this->success(['message' => 'Categoría creada correctamente', 'id' => (int)$this->db->lastInsertId()], 201);
    }

    private function updateCategoria(int $id): void
    {
        $data = $this->parseBody();
        $stmt = $this->db->prepare("SELECT * FROM biblioteca_categorias WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { $this->error('Categoría no encontrada', 404); return; }

        $stmt = $this->db->prepare("
            UPDATE biblioteca_categorias SET
                nombre      = :nombre,
                descripcion = :descripcion,
                icono       = :icono,
                color       = :color,
                orden       = :orden,
                updated_at  = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':nombre'      => $this->clean($data['nombre']      ?? $existing['nombre']),
            ':descripcion' => $this->clean($data['descripcion'] ?? $existing['descripcion'] ?? ''),
            ':icono'       => $this->clean($data['icono']       ?? $existing['icono']       ?? 'book'),
            ':color'       => $this->clean($data['color']       ?? $existing['color']       ?? '#007bff'),
            ':orden'       => (int)($data['orden']              ?? $existing['orden']),
            ':id'          => $id,
        ]);

        $this->success(['message' => 'Categoría actualizada correctamente']);
    }

    private function destroyCategoria(int $id): void
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM biblioteca_libros WHERE categoria_id = :id");
        $stmt->execute([':id' => $id]);
        if ($stmt->fetchColumn() > 0) {
            $this->error('No se puede eliminar: la categoría tiene libros asociados', 400); return;
        }

        $this->db->prepare("DELETE FROM biblioteca_categorias WHERE id = :id")->execute([':id' => $id]);
        $this->success(['message' => 'Categoría eliminada correctamente']);
    }

    /* ══ ESTADÍSTICAS ══ */
    private function adminEstadisticas(): void
    {
        $this->success(['data' => $this->getEstadisticas()]);
    }

    private function getEstadisticas(): array
    {
        $totalLibros = $this->db->query("SELECT COUNT(*) FROM biblioteca_libros WHERE activo = 1")->fetchColumn();
        $totalCats   = $this->db->query("SELECT COUNT(*) FROM biblioteca_categorias WHERE activo = 1")->fetchColumn();
        $totalDesc   = $this->db->query("SELECT SUM(descargas) FROM biblioteca_libros WHERE activo = 1")->fetchColumn();

        $masDesc = $this->db->query("
            SELECT id, titulo, descargas FROM biblioteca_libros WHERE activo = 1
            ORDER BY descargas DESC LIMIT 1
        ")->fetch(PDO::FETCH_ASSOC);

        return [
            'totalLibros'        => (int)$totalLibros,
            'totalCategorias'    => (int)$totalCats,
            'totalDescargas'     => (int)$totalDesc,
            'libroMasDescargado' => $masDesc ?: null,
        ];
    }

    /* ══ HELPERS ══ */
    private function formatLibro(array $row): array
    {
        $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host  = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $base  = "{$proto}://{$host}/public/uploads/biblioteca/";

        $row['id']         = (int)$row['id'];
        $row['descargas']  = (int)($row['descargas'] ?? 0);
        $row['vistas']     = (int)($row['vistas']    ?? 0);
        $row['destacado']  = isset($row['destacado']) ? (bool)$row['destacado'] : false;
        $row['activo']     = isset($row['activo'])    ? (bool)$row['activo']    : true;

        if ($row['archivo'] && !str_starts_with($row['archivo'], 'http')) {
            $row['archivo'] = $base . $row['archivo'];
        }
        if (!empty($row['miniatura']) && !str_starts_with($row['miniatura'], 'http')) {
            $row['miniatura'] = $base . $row['miniatura'];
        }

        return $row;
    }

    private function uploadPDF(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  10 * 1024 * 1024) return false;

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if ($mime !== 'application/pdf') return false;
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);

        $nombre = bin2hex(random_bytes(16)) . '.pdf';
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
    }

    private function uploadImagen(array $file): string|false
    {
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if ($file['error'] !== UPLOAD_ERR_OK) return false;
        if ($file['size']  >  2 * 1024 * 1024) return false;

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, $allowed)) return false;
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);

        $nombre = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        if (!move_uploaded_file($file['tmp_name'], $this->uploadDir . $nombre)) return false;
        return $nombre;
    }

    private function deleteUpload(string $nombre): void
    {
        if (!$nombre) return;
        $path = $this->uploadDir . basename($nombre);
        if (file_exists($path)) @unlink($path);
    }

    private function slugify(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9\s-]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', $text));
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
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
