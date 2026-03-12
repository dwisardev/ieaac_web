<?php
require_once __DIR__ . '/../config/Database.php';

class LogrosController {
    private PDO $db;
    private string $uploadDir;
    private array $tiposMime = ['image/jpeg','image/png','image/webp','image/gif'];

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/logros/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0775, true);
    }

    /* ── Pública ── */
    public function handlePublic(array $seg): void {
        match($_SERVER['REQUEST_METHOD']) {
            'GET'  => $this->listarPublico(),
            default => $this->json(['error' => 'Método no permitido'], 405),
        };
    }

    /* ── Admin ── */
    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $id = $seg[0] ?? null;

        match(true) {
            $method === 'GET' && !$id            => $this->listarAdmin(),
            $method === 'GET' && $id             => $this->mostrar((int)$id),
            $method === 'POST' && !$id           => $this->crear($user),
            $method === 'PUT'  && $id            => $this->actualizar((int)$id, $user),
            $method === 'DELETE' && $id          => $this->eliminar((int)$id),
            $method === 'PATCH' && $id           => $this->toggleActivo((int)$id),
            default                              => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Público: logros activos ── */
    private function listarPublico(): void {
        $cat = $_GET['categoria'] ?? null;
        $dest = $_GET['destacado'] ?? null;
        $limit = min((int)($_GET['limit'] ?? 50), 100);

        $where = ['activo = 1'];
        $params = [];

        if ($cat) { $where[] = 'categoria = :cat'; $params['cat'] = $cat; }
        if ($dest !== null) { $where[] = 'destacado = :dest'; $params['dest'] = (int)$dest; }

        $sql = 'SELECT * FROM logros WHERE ' . implode(' AND ', $where)
             . ' ORDER BY destacado DESC, fecha_logro DESC LIMIT :limit';
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /* ── Admin: todos ── */
    private function listarAdmin(): void {
        $q = $_GET['q'] ?? null;
        $cat = $_GET['categoria'] ?? null;
        $dest = $_GET['destacado'] ?? null;

        $where = ['1=1'];
        $params = [];

        if ($q) { $where[] = '(titulo LIKE :q OR descripcion LIKE :q)'; $params['q'] = "%$q%"; }
        if ($cat) { $where[] = 'categoria = :cat'; $params['cat'] = $cat; }
        if ($dest !== null) { $where[] = 'destacado = :dest'; $params['dest'] = (int)$dest; }

        $sql = 'SELECT * FROM logros WHERE ' . implode(' AND ', $where)
             . ' ORDER BY fecha_logro DESC';
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM logros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($row);
    }

    private function crear(array $user): void {
        $data = $this->bodyData();
        $imagenPath = $this->subirImagen();

        $stmt = $this->db->prepare(
            'INSERT INTO logros (titulo, descripcion, categoria, fecha_logro, imagen, destacado, activo, orden)
             VALUES (:titulo, :descripcion, :categoria, :fecha_logro, :imagen, :destacado, :activo, :orden)'
        );
        $stmt->execute([
            'titulo'      => $data['titulo'] ?? '',
            'descripcion' => $data['descripcion'] ?? '',
            'categoria'   => $data['categoria'] ?? 'Académico',
            'fecha_logro' => $data['fecha_logro'] ?? date('Y-m-d'),
            'imagen'      => $imagenPath,
            'destacado'   => (int)($data['destacado'] ?? 0),
            'activo'      => 1,
            'orden'       => (int)($data['orden'] ?? 0),
        ]);
        $id = $this->db->lastInsertId();
        $stmt2 = $this->db->prepare('SELECT * FROM logros WHERE id = ?');
        $stmt2->execute([$id]);
        $this->json($stmt2->fetch(PDO::FETCH_ASSOC), 201);
    }

    private function actualizar(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM logros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data = $this->bodyData();
        $imagenPath = $this->subirImagen() ?? $row['imagen'];

        $upd = $this->db->prepare(
            'UPDATE logros SET titulo=:titulo, descripcion=:descripcion, categoria=:categoria,
             fecha_logro=:fecha_logro, imagen=:imagen, destacado=:destacado, activo=:activo, orden=:orden
             WHERE id=:id'
        );
        $upd->execute([
            'titulo'      => $data['titulo'] ?? $row['titulo'],
            'descripcion' => $data['descripcion'] ?? $row['descripcion'],
            'categoria'   => $data['categoria'] ?? $row['categoria'],
            'fecha_logro' => $data['fecha_logro'] ?? $row['fecha_logro'],
            'imagen'      => $imagenPath,
            'destacado'   => isset($data['destacado']) ? (int)$data['destacado'] : $row['destacado'],
            'activo'      => isset($data['activo']) ? (int)$data['activo'] : $row['activo'],
            'orden'       => isset($data['orden']) ? (int)$data['orden'] : $row['orden'],
            'id'          => $id,
        ]);
        $stmt2 = $this->db->prepare('SELECT * FROM logros WHERE id = ?');
        $stmt2->execute([$id]);
        $this->json($stmt2->fetch(PDO::FETCH_ASSOC));
    }

    private function eliminar(int $id): void {
        $stmt = $this->db->prepare('SELECT imagen FROM logros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        if ($row['imagen'] && file_exists($this->uploadDir . basename($row['imagen']))) {
            unlink($this->uploadDir . basename($row['imagen']));
        }
        $this->db->prepare('DELETE FROM logros WHERE id = ?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    private function toggleActivo(int $id): void {
        $stmt = $this->db->prepare('SELECT activo FROM logros WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $nuevo = $row['activo'] ? 0 : 1;
        $this->db->prepare('UPDATE logros SET activo=? WHERE id=?')->execute([$nuevo, $id]);
        $this->json(['activo' => $nuevo]);
    }

    /* ── Helpers ── */
    private function bodyData(): array {
        if (!empty($_POST)) return $_POST;
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }

    private function subirImagen(): ?string {
        if (empty($_FILES['imagen']['tmp_name'])) return null;
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES['imagen']['tmp_name']);
        if (!in_array($mime, $this->tiposMime)) return null;
        $ext  = explode('/', $mime)[1];
        $name = uniqid('logro_', true) . '.' . $ext;
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $this->uploadDir . $name)) return null;
        return '/public/uploads/logros/' . $name;
    }

    private function json(mixed $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
