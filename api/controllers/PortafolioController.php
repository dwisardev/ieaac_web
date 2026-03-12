<?php
require_once __DIR__ . '/../config/Database.php';

class PortafolioController {
    private PDO $db;
    private string $uploadDir;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/portafolio/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0775, true);
    }

    /* ── Pública ── */
    public function handlePublic(array $seg): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $this->json(['error' => 'Método no permitido'], 405);
            return;
        }
        $action = $seg[0] ?? null;
        match($action) {
            'estadisticas' => $this->estadisticas(),
            default        => $this->listarPublico(),
        };
    }

    /* ── Admin ── */
    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $id = isset($seg[0]) && is_numeric($seg[0]) ? (int)$seg[0] : null;
        $sub = $seg[0] ?? null;

        match(true) {
            $method === 'GET' && $sub === 'estadisticas' => $this->estadisticas(),
            $method === 'GET' && !$id                    => $this->listarAdmin(),
            $method === 'GET' && $id                     => $this->mostrar($id),
            $method === 'POST' && !$id                   => $this->crear($user),
            $method === 'PUT' && $id                     => $this->actualizar($id, $user),
            $method === 'DELETE' && $id                  => $this->eliminar($id),
            $method === 'PATCH' && $id                   => $this->toggleActivo($id),
            default                                      => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Estadísticas ── */
    private function estadisticas(): void {
        $total = (int)$this->db->query('SELECT COUNT(*) FROM portafolio_actividades WHERE activo=1')->fetchColumn();
        $dest  = (int)$this->db->query('SELECT COUNT(*) FROM portafolio_actividades WHERE activo=1 AND destacado=1')->fetchColumn();
        $rubros = (int)$this->db->query(
            'SELECT COUNT(DISTINCT rubro) FROM portafolio_actividades WHERE activo=1'
        )->fetchColumn();

        $this->json([
            'totalActividades'         => $total,
            'totalArchivos'            => 0, // calculado en el frontend desde galeria_imagenes
            'actividadesDestacadas'    => $dest,
            'rubrosActivos'            => $rubros,
        ]);
    }

    /* ── Público agrupado por rubro ── */
    private function listarPublico(): void {
        $rubro = $_GET['rubro'] ?? null;
        $cat   = $_GET['categoria'] ?? null;
        $dest  = $_GET['destacado'] ?? null;

        $where = ['activo=1'];
        $params = [];

        if ($rubro) { $where[] = 'rubro=:rubro'; $params['rubro'] = $rubro; }
        if ($cat)   { $where[] = 'categoria=:cat'; $params['cat'] = $cat; }
        if ($dest !== null) { $where[] = 'destacado=:dest'; $params['dest'] = (int)$dest; }

        $stmt = $this->db->prepare(
            'SELECT * FROM portafolio_actividades WHERE ' . implode(' AND ', $where) .
            ' ORDER BY rubro ASC, orden ASC, fecha_realizacion DESC'
        );
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decodificar JSON fields
        $rows = array_map([$this, 'decodeJsonFields'], $rows);

        // Agrupar por rubro
        $grouped = [];
        foreach ($rows as $act) {
            $r = $act['rubro'];
            if (!isset($grouped[$r])) $grouped[$r] = [];
            $grouped[$r][] = $act;
        }
        $this->json($grouped);
    }

    /* ── Admin lista ── */
    private function listarAdmin(): void {
        $q    = $_GET['q'] ?? null;
        $rubro = $_GET['rubro'] ?? null;

        $where = ['1=1'];
        $params = [];

        if ($q)    { $where[] = '(titulo LIKE :q OR descripcion LIKE :q)'; $params['q'] = "%$q%"; }
        if ($rubro){ $where[] = 'rubro=:rubro'; $params['rubro'] = $rubro; }

        $stmt = $this->db->prepare(
            'SELECT * FROM portafolio_actividades WHERE ' . implode(' AND ', $where) .
            ' ORDER BY rubro ASC, orden ASC'
        );
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->json(array_map([$this, 'decodeJsonFields'], $rows));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM portafolio_actividades WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($this->decodeJsonFields($row));
    }

    private function crear(array $user): void {
        $data = $this->bodyData();
        $imgUrl = $this->subirImagen('imagen');

        $participantes = is_array($data['participantes'] ?? null)
            ? $data['participantes'] : (json_decode($data['participantes'] ?? '[]', true) ?? []);

        $stmt = $this->db->prepare(
            'INSERT INTO portafolio_actividades
             (titulo, descripcion, categoria, rubro, fecha_realizacion, responsables,
              participantes, imagen_principal, resultados, lecciones_aprendidas, destacado, orden, activo)
             VALUES (:t,:d,:cat,:r,:f,:resp,:part,:img,:res,:lec,:dest,:ord,:activo)'
        );
        $stmt->execute([
            't'      => $data['titulo'] ?? '',
            'd'      => $data['descripcion'] ?? '',
            'cat'    => $data['categoria'] ?? 'otro',
            'r'      => $data['rubro'] ?? '',
            'f'      => $data['fecha_realizacion'] ?? null,
            'resp'   => $data['responsables'] ?? null,
            'part'   => json_encode($participantes, JSON_UNESCAPED_UNICODE),
            'img'    => $imgUrl,
            'res'    => $data['resultados'] ?? null,
            'lec'    => $data['lecciones_aprendidas'] ?? null,
            'dest'   => (int)($data['destacado'] ?? 0),
            'ord'    => (int)($data['orden'] ?? 0),
            'activo' => 1,
        ]);
        $this->json(['id' => $this->db->lastInsertId(), 'ok' => true], 201);
    }

    private function actualizar(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM portafolio_actividades WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data   = $this->bodyData();
        $imgUrl = $this->subirImagen('imagen') ?? $row['imagen_principal'];

        $participantes = is_array($data['participantes'] ?? null)
            ? $data['participantes'] : (json_decode($data['participantes'] ?? null, true) ?? json_decode($row['participantes'] ?? '[]', true));

        $this->db->prepare(
            'UPDATE portafolio_actividades SET
             titulo=:t, descripcion=:d, categoria=:cat, rubro=:r, fecha_realizacion=:f,
             responsables=:resp, participantes=:part, imagen_principal=:img,
             resultados=:res, lecciones_aprendidas=:lec, destacado=:dest, orden=:ord, activo=:activo
             WHERE id=:id'
        )->execute([
            't'      => $data['titulo'] ?? $row['titulo'],
            'd'      => $data['descripcion'] ?? $row['descripcion'],
            'cat'    => $data['categoria'] ?? $row['categoria'],
            'r'      => $data['rubro'] ?? $row['rubro'],
            'f'      => $data['fecha_realizacion'] ?? $row['fecha_realizacion'],
            'resp'   => $data['responsables'] ?? $row['responsables'],
            'part'   => json_encode($participantes, JSON_UNESCAPED_UNICODE),
            'img'    => $imgUrl,
            'res'    => $data['resultados'] ?? $row['resultados'],
            'lec'    => $data['lecciones_aprendidas'] ?? $row['lecciones_aprendidas'],
            'dest'   => isset($data['destacado']) ? (int)$data['destacado'] : $row['destacado'],
            'ord'    => isset($data['orden']) ? (int)$data['orden'] : $row['orden'],
            'activo' => isset($data['activo']) ? (int)$data['activo'] : $row['activo'],
            'id'     => $id,
        ]);
        $this->json(['ok' => true]);
    }

    private function eliminar(int $id): void {
        $this->db->prepare('DELETE FROM portafolio_actividades WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    private function toggleActivo(int $id): void {
        $stmt = $this->db->prepare('SELECT activo FROM portafolio_actividades WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $nuevo = $row['activo'] ? 0 : 1;
        $this->db->prepare('UPDATE portafolio_actividades SET activo=? WHERE id=?')->execute([$nuevo, $id]);
        $this->json(['activo' => $nuevo]);
    }

    /* ── Helpers ── */
    private function decodeJsonFields(array $row): array {
        foreach (['participantes', 'galeria_imagenes', 'archivos_adjuntos'] as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $row[$field] = json_decode($row[$field], true) ?? [];
            }
        }
        return $row;
    }

    private function subirImagen(string $campo): ?string {
        if (empty($_FILES[$campo]['tmp_name'])) return null;
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES[$campo]['tmp_name']);
        $tipos = ['image/jpeg','image/png','image/webp','image/gif'];
        if (!in_array($mime, $tipos)) return null;
        $ext  = explode('/', $mime)[1];
        $name = uniqid('portafolio_', true) . '.' . $ext;
        if (!move_uploaded_file($_FILES[$campo]['tmp_name'], $this->uploadDir . $name)) return null;
        return '/public/uploads/portafolio/' . $name;
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
