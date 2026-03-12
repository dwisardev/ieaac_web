<?php
require_once __DIR__ . '/../config/Database.php';

class MiembrosController {
    private PDO $db;
    private string $uploadDir;
    private array $tiposMime = ['image/jpeg','image/png','image/webp'];

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/miembros/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0775, true);
    }

    public function handlePublic(array $seg): void {
        match($_SERVER['REQUEST_METHOD']) {
            'GET'  => $this->handlePublicGet($seg),
            default => $this->json(['error' => 'Método no permitido'], 405),
        };
    }

    private function handlePublicGet(array $seg): void {
        $action = $seg[0] ?? null;
        match($action) {
            'categorias' => $this->listarCategorias(),
            'completo'   => $this->obtenerCompleto(),
            default      => $this->listarPublico(),
        };
    }

    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $action = $seg[0] ?? null;
        $id     = is_numeric($action) ? (int)$action : null;
        $sub    = $seg[1] ?? null;

        match(true) {
            $method === 'GET'    && $action === 'categorias' => $this->listarCategorias(),
            $method === 'GET'    && $action === 'completo'   => $this->obtenerCompleto(),
            $method === 'POST'   && $action === 'categoria'  => $this->uploadFotoGrupo((int)$sub, $user),
            $method === 'DELETE' && $action === 'categoria'  => $this->deleteFotoGrupo((int)$sub, $user),
            $method === 'GET'    && !$id                     => $this->listarAdmin(),
            $method === 'GET'    && $id                      => $this->mostrar($id),
            $method === 'POST'   && !$id                     => $this->crear($user),
            $method === 'PUT'    && $id                      => $this->actualizar($id, $user),
            $method === 'DELETE' && $id                      => $this->eliminar($id),
            $method === 'PATCH'  && $id                      => $this->toggleActivo($id),
            default                                          => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    private function listarCategorias(): void {
        $stmt = $this->db->query('SELECT * FROM categorias_miembros WHERE activo=1 ORDER BY orden ASC');
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function obtenerCompleto(): void {
        $anio = (int)($_GET['anio'] ?? date('Y'));

        $cats = $this->db->query(
            'SELECT * FROM categorias_miembros WHERE activo=1 ORDER BY orden ASC'
        )->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $this->db->prepare(
            'SELECT m.*, c.slug as categoria_slug, c.nombre as categoria_nombre
             FROM miembros m
             JOIN categorias_miembros c ON m.categoria_id = c.id
             WHERE m.activo=1 AND m.anio_escolar=?
             ORDER BY m.orden ASC'
        );
        $stmt->execute([$anio]);
        $miembros = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $fotos_grupo = [];
        foreach ($cats as $cat) {
            if (!empty($cat['foto_grupo'])) {
                $fotos_grupo[$cat['slug']] = $cat['foto_grupo'];
            }
        }

        $result = ['director' => null, 'categorias' => $cats, 'fotos_grupo' => $fotos_grupo];

        foreach ($cats as $cat) {
            $slug  = $cat['slug'];
            $lista = array_values(array_filter($miembros, fn($m) => $m['categoria_slug'] === $slug));
            if ($slug === 'director') {
                $result['director'] = $lista[0] ?? null;
            } else {
                $key = lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $slug))));
                $result[$key] = $lista;
            }
        }

        $this->json($result);
    }

    private function listarPublico(): void {
        $anio  = (int)($_GET['anio'] ?? date('Y'));
        $cat   = $_GET['categoria'] ?? null;

        $where  = ['m.activo=1', 'm.anio_escolar=:anio'];
        $params = ['anio' => $anio];

        if ($cat) {
            $where[]       = 'c.slug=:cat';
            $params['cat'] = $cat;
        }

        $stmt = $this->db->prepare(
            'SELECT m.*, c.slug as categoria_slug, c.nombre as categoria_nombre
             FROM miembros m
             JOIN categorias_miembros c ON m.categoria_id = c.id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY m.orden ASC'
        );
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function listarAdmin(): void {
        $anio = $_GET['anio'] ?? null;
        $cat  = $_GET['categoria'] ?? null;
        $q    = $_GET['q'] ?? null;

        $where  = ['1=1'];
        $params = [];

        if ($anio) { $where[] = 'm.anio_escolar=:anio'; $params['anio'] = (int)$anio; }
        if ($cat)  { $where[] = 'c.slug=:cat';          $params['cat']  = $cat; }
        if ($q)    { $where[] = 'm.nombre LIKE :q';      $params['q']   = "%$q%"; }

        $stmt = $this->db->prepare(
            'SELECT m.*, c.slug as categoria_slug, c.nombre as categoria_nombre
             FROM miembros m
             JOIN categorias_miembros c ON m.categoria_id = c.id
             WHERE ' . implode(' AND ', $where) . '
             ORDER BY m.anio_escolar DESC, m.orden ASC'
        );
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare(
            'SELECT m.*, c.slug as categoria_slug, c.nombre as categoria_nombre
             FROM miembros m
             JOIN categorias_miembros c ON m.categoria_id = c.id
             WHERE m.id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($row);
    }

    private function crear(array $user): void {
        $data  = $this->bodyData();
        $catId = $this->resolveCatId($data);

        $stmt = $this->db->prepare(
            'INSERT INTO miembros (categoria_id, nombre, cargo, especialidad, condicion, celular, email, rol, orden, anio_escolar, activo)
             VALUES (:cat_id, :nombre, :cargo, :especialidad, :condicion, :celular, :email, :rol, :orden, :anio, :activo)'
        );
        $stmt->execute([
            'cat_id'       => $catId,
            'nombre'       => $data['nombre']       ?? '',
            'cargo'        => $data['cargo']        ?? null,
            'especialidad' => $data['especialidad'] ?? null,
            'condicion'    => $data['condicion']    ?? null,
            'celular'      => $data['celular']      ?? null,
            'email'        => $data['email']        ?? null,
            'rol'          => $data['rol']          ?? null,
            'orden'        => (int)($data['orden']  ?? 1),
            'anio'         => (int)($data['anio_escolar'] ?? date('Y')),
            'activo'       => 1,
        ]);
        $id = $this->db->lastInsertId();
        $this->mostrar((int)$id);
    }

    private function actualizar(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM miembros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data  = $this->bodyData();
        $catId = $this->resolveCatId($data) ?? $row['categoria_id'];

        $this->db->prepare(
            'UPDATE miembros SET categoria_id=:cat_id, nombre=:nombre, cargo=:cargo,
             especialidad=:especialidad, condicion=:condicion, celular=:celular, email=:email,
             rol=:rol, orden=:orden, anio_escolar=:anio, activo=:activo WHERE id=:id'
        )->execute([
            'cat_id'       => $catId,
            'nombre'       => $data['nombre']       ?? $row['nombre'],
            'cargo'        => $data['cargo']        ?? $row['cargo'],
            'especialidad' => $data['especialidad'] ?? $row['especialidad'],
            'condicion'    => $data['condicion']    ?? $row['condicion'],
            'celular'      => $data['celular']      ?? $row['celular'],
            'email'        => $data['email']        ?? $row['email'],
            'rol'          => $data['rol']          ?? $row['rol'],
            'orden'        => isset($data['orden'])  ? (int)$data['orden'] : $row['orden'],
            'anio'         => isset($data['anio_escolar']) ? (int)$data['anio_escolar'] : $row['anio_escolar'],
            'activo'       => isset($data['activo']) ? (int)$data['activo'] : $row['activo'],
            'id'           => $id,
        ]);
        $this->mostrar($id);
    }

    private function eliminar(int $id): void {
        $stmt = $this->db->prepare('SELECT id FROM miembros WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->db->prepare('DELETE FROM miembros WHERE id = ?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    private function toggleActivo(int $id): void {
        $stmt = $this->db->prepare('SELECT activo FROM miembros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $nuevo = $row['activo'] ? 0 : 1;
        $this->db->prepare('UPDATE miembros SET activo=? WHERE id=?')->execute([$nuevo, $id]);
        $this->json(['activo' => $nuevo]);
    }

    private function uploadFotoGrupo(int $catId, array $user): void {
        if (!$catId) { $this->json(['error' => 'ID de categoría requerido'], 400); return; }

        $stmt = $this->db->prepare('SELECT id, foto_grupo FROM categorias_miembros WHERE id=?');
        $stmt->execute([$catId]);
        $cat = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cat) { $this->json(['error' => 'Categoría no encontrada'], 404); return; }

        $fotoUrl = $this->subirFotoGrupo();
        if (!$fotoUrl) { $this->json(['error' => 'No se pudo subir (JPG, PNG, WEBP, máx 5MB)'], 422); return; }

        if ($cat['foto_grupo']) {
            $old = $this->uploadDir . basename($cat['foto_grupo']);
            if (file_exists($old)) @unlink($old);
        }

        $this->db->prepare('UPDATE categorias_miembros SET foto_grupo=? WHERE id=?')
                 ->execute([$fotoUrl, $catId]);
        $this->json(['ok' => true, 'foto_grupo' => $fotoUrl]);
    }

    private function deleteFotoGrupo(int $catId, array $user): void {
        if (!$catId) { $this->json(['error' => 'ID de categoría requerido'], 400); return; }

        $stmt = $this->db->prepare('SELECT foto_grupo FROM categorias_miembros WHERE id=?');
        $stmt->execute([$catId]);
        $cat = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cat) { $this->json(['error' => 'Categoría no encontrada'], 404); return; }

        if ($cat['foto_grupo']) {
            $old = $this->uploadDir . basename($cat['foto_grupo']);
            if (file_exists($old)) @unlink($old);
            $this->db->prepare('UPDATE categorias_miembros SET foto_grupo=NULL WHERE id=?')
                     ->execute([$catId]);
        }
        $this->json(['ok' => true]);
    }

    private function subirFotoGrupo(): ?string {
        if (empty($_FILES['foto_grupo']['tmp_name'])) return null;
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES['foto_grupo']['tmp_name']);
        if (!in_array($mime, $this->tiposMime)) return null;
        $ext  = explode('/', $mime)[1];
        $name = uniqid('grupo_', true) . '.' . $ext;
        if (!move_uploaded_file($_FILES['foto_grupo']['tmp_name'], $this->uploadDir . $name)) return null;
        return '/public/uploads/miembros/' . $name;
    }

    private function resolveCatId(array $data): ?int {
        if (!empty($data['categoria_id'])) return (int)$data['categoria_id'];
        if (!empty($data['categoria_slug'])) {
            $stmt = $this->db->prepare('SELECT id FROM categorias_miembros WHERE slug=?');
            $stmt->execute([$data['categoria_slug']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ? (int)$row['id'] : null;
        }
        return null;
    }

    private function bodyData(): array {
        if (!empty($_POST)) return $_POST;
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }

    private function json(mixed $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
