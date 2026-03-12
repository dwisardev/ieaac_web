<?php
require_once __DIR__ . '/../config/Database.php';

class CronogramaController {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
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
            default        => $this->listar(),
        };
    }

    /* ── Admin ── */
    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $id  = isset($seg[0]) && is_numeric($seg[0]) ? (int)$seg[0] : null;
        $sub = $seg[0] ?? null;

        match(true) {
            $method === 'GET'    && $sub === 'estadisticas' => $this->estadisticas(),
            $method === 'GET'    && !$id                    => $this->listarAdmin(),
            $method === 'GET'    && $id                     => $this->mostrar($id),
            $method === 'POST'   && !$id                    => $this->crear($user),
            $method === 'PUT'    && $id                     => $this->actualizar($id, $user),
            $method === 'DELETE' && $id                     => $this->eliminar($id),
            $method === 'PATCH'  && $id                     => $this->toggleActivo($id),
            default                                         => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Listar agrupado por mes (público) ── */
    private function listar(): void {
        $stmt = $this->db->query(
            'SELECT id, mes, orden_mes, titulo, responsables, estado, progreso, conteo, evidencia, url_evidencia
             FROM cronograma_actividades
             WHERE activo = 1
             ORDER BY orden_mes ASC, id ASC'
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $agrupado = [];
        foreach ($rows as $row) {
            $mes = $row['mes'];
            if (!isset($agrupado[$mes])) {
                $agrupado[$mes] = [
                    'id'          => $mes,
                    'mes'         => $mes,
                    'mes_numero'  => (int)$row['orden_mes'],
                    'actividades' => [],
                ];
            }
            $agrupado[$mes]['actividades'][] = [
                'id'           => (int)$row['id'],
                'titulo'       => $row['titulo'],
                'responsables' => $row['responsables'],
                'estado'       => $row['estado'],
                'progreso'     => (int)$row['progreso'],
                'conteo'       => $row['conteo'],
                'evidencia'    => (bool)$row['evidencia'],
                'url_evidencia'=> $row['url_evidencia'],
            ];
        }

        $this->json(array_values($agrupado));
    }

    /* ── Listar sin agrupar (admin) ── */
    private function listarAdmin(): void {
        $stmt = $this->db->query(
            'SELECT * FROM cronograma_actividades ORDER BY orden_mes ASC, id ASC'
        );
        $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM cronograma_actividades WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($row);
    }

    private function estadisticas(): void {
        $total = (int)$this->db->query('SELECT COUNT(*) FROM cronograma_actividades WHERE activo=1')->fetchColumn();
        $comp  = (int)$this->db->query("SELECT COUNT(*) FROM cronograma_actividades WHERE activo=1 AND estado='completado'")->fetchColumn();
        $prog  = (int)$this->db->query("SELECT COUNT(*) FROM cronograma_actividades WHERE activo=1 AND estado='en_progreso'")->fetchColumn();
        $pct   = $total > 0 ? round(($comp / $total) * 100) : 0;

        $this->json([
            'totalActividades'     => $total,
            'completadas'          => $comp,
            'enProgreso'           => $prog,
            'porcentajeCompletado' => $pct,
        ]);
    }

    private function crear(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO cronograma_actividades
             (mes, orden_mes, titulo, responsables, estado, progreso, conteo, evidencia, url_evidencia, descripcion, activo)
             VALUES (:mes, :orden_mes, :titulo, :responsables, :estado, :progreso, :conteo, :evidencia, :url_evidencia, :descripcion, :activo)'
        );
        $stmt->execute([
            'mes'          => $data['mes'] ?? '',
            'orden_mes'    => (int)($data['orden_mes'] ?? 1),
            'titulo'       => $data['titulo'] ?? '',
            'responsables' => $data['responsables'] ?? '',
            'estado'       => $data['estado'] ?? 'pendiente',
            'progreso'     => (int)($data['progreso'] ?? 0),
            'conteo'       => $data['conteo'] ?? null,
            'evidencia'    => isset($data['evidencia']) ? (int)$data['evidencia'] : 0,
            'url_evidencia'=> $data['url_evidencia'] ?? null,
            'descripcion'  => $data['descripcion'] ?? null,
            'activo'       => isset($data['activo']) ? (int)$data['activo'] : 1,
        ]);
        $this->json(['id' => (int)$this->db->lastInsertId()], 201);
    }

    private function actualizar(int $id, array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'UPDATE cronograma_actividades
             SET mes=:mes, orden_mes=:orden_mes, titulo=:titulo, responsables=:responsables,
                 estado=:estado, progreso=:progreso, conteo=:conteo, evidencia=:evidencia,
                 url_evidencia=:url_evidencia, descripcion=:descripcion, activo=:activo
             WHERE id=:id'
        );
        $stmt->execute([
            'mes'          => $data['mes'] ?? '',
            'orden_mes'    => (int)($data['orden_mes'] ?? 1),
            'titulo'       => $data['titulo'] ?? '',
            'responsables' => $data['responsables'] ?? '',
            'estado'       => $data['estado'] ?? 'pendiente',
            'progreso'     => (int)($data['progreso'] ?? 0),
            'conteo'       => $data['conteo'] ?? null,
            'evidencia'    => isset($data['evidencia']) ? (int)$data['evidencia'] : 0,
            'url_evidencia'=> $data['url_evidencia'] ?? null,
            'descripcion'  => $data['descripcion'] ?? null,
            'activo'       => isset($data['activo']) ? (int)$data['activo'] : 1,
            'id'           => $id,
        ]);
        $this->json(['success' => true]);
    }

    private function eliminar(int $id): void {
        $this->db->prepare('UPDATE cronograma_actividades SET activo=0 WHERE id=:id')->execute(['id' => $id]);
        $this->json(['success' => true]);
    }

    private function toggleActivo(int $id): void {
        $this->db->prepare('UPDATE cronograma_actividades SET activo = 1-activo WHERE id=:id')->execute(['id' => $id]);
        $this->json(['success' => true]);
    }

    private function bodyData(): array {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }

    private function json(mixed $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode(['success' => $code < 400, 'data' => $data], JSON_UNESCAPED_UNICODE);
    }
}
