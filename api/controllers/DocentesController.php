<?php
require_once __DIR__ . '/../config/Database.php';

class DocentesController {
    private PDO $db;
    private string $uploadDir;
    private array $tiposMime = ['image/jpeg','image/png','image/webp'];

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/docentes/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0775, true);
    }

    /* ── Pública ── */
    public function handlePublic(array $seg): void {
        match($_SERVER['REQUEST_METHOD']) {
            'GET'  => empty($seg[0])
                ? $this->listarPublico()
                : $this->mostrar((int)$seg[0]),
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

    /* ── Público: activos ── */
    private function listarPublico(): void {
        $stmt = $this->db->query(
            'SELECT id, nombre_completo, nombre_corto, especialidad, foto
             FROM docentes WHERE activo=1 ORDER BY nombre_completo ASC'
        );
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /* ── Admin: todos ── */
    private function listarAdmin(): void {
        $q = $_GET['q'] ?? null;
        $where = ['activo = 1'];
        $params = [];

        if ($q) {
            $where[] = '(nombre_completo LIKE :q OR especialidad LIKE :q OR email LIKE :q)';
            $params['q'] = "%$q%";
        }

        $stmt = $this->db->prepare(
            'SELECT * FROM docentes WHERE ' . implode(' AND ', $where) . ' ORDER BY nombre_completo ASC'
        );
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM docentes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($row);
    }

    private function crear(array $user): void {
        $data    = $this->bodyData();
        $fotoUrl = $this->subirFoto();

        $stmt = $this->db->prepare(
            'INSERT INTO docentes (nombre_completo, nombre_corto, especialidad, email, telefono, foto, fecha_ingreso, activo)
             VALUES (:nc,:ns,:esp,:email,:tel,:foto,:fi,:activo)'
        );
        $stmt->execute([
            'nc'     => $data['nombre_completo'] ?? '',
            'ns'     => $data['nombre_corto'] ?? '',
            'esp'    => $data['especialidad'] ?? null,
            'email'  => $data['email'] ?? null,
            'tel'    => $data['telefono'] ?? null,
            'foto'   => $fotoUrl,
            'fi'     => $data['fecha_ingreso'] ?? null,
            'activo' => 1,
        ]);
        $id = $this->db->lastInsertId();
        $this->mostrar((int)$id);
    }

    private function actualizar(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM docentes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data    = $this->bodyData();
        $fotoUrl = $this->subirFoto() ?? $row['foto'];

        $this->db->prepare(
            'UPDATE docentes SET nombre_completo=:nc, nombre_corto=:ns, especialidad=:esp,
             email=:email, telefono=:tel, foto=:foto, fecha_ingreso=:fi, activo=:activo WHERE id=:id'
        )->execute([
            'nc'     => $data['nombre_completo'] ?? $row['nombre_completo'],
            'ns'     => $data['nombre_corto'] ?? $row['nombre_corto'],
            'esp'    => $data['especialidad'] ?? $row['especialidad'],
            'email'  => $data['email'] ?? $row['email'],
            'tel'    => $data['telefono'] ?? $row['telefono'],
            'foto'   => $fotoUrl,
            'fi'     => $data['fecha_ingreso'] ?? $row['fecha_ingreso'],
            'activo' => isset($data['activo']) ? (int)$data['activo'] : $row['activo'],
            'id'     => $id,
        ]);
        $this->mostrar($id);
    }

    private function eliminar(int $id): void {
        $stmt = $this->db->prepare('SELECT foto FROM docentes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        // Soft delete
        $this->db->prepare('UPDATE docentes SET activo=0 WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    private function toggleActivo(int $id): void {
        $stmt = $this->db->prepare('SELECT activo FROM docentes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $nuevo = $row['activo'] ? 0 : 1;
        $this->db->prepare('UPDATE docentes SET activo=? WHERE id=?')->execute([$nuevo, $id]);
        $this->json(['activo' => $nuevo]);
    }

    private function subirFoto(): ?string {
        if (empty($_FILES['foto']['tmp_name'])) return null;
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES['foto']['tmp_name']);
        if (!in_array($mime, $this->tiposMime)) return null;
        $ext  = explode('/', $mime)[1];
        $name = uniqid('docente_', true) . '.' . $ext;
        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $this->uploadDir . $name)) return null;
        return '/public/uploads/docentes/' . $name;
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
