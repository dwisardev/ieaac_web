<?php
require_once __DIR__ . '/../config/Database.php';

class MonitoreoController {
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
            'estadisticas' => $this->estadisticasGenerales(),
            default        => $this->dimensionesConIndicadores(),
        };
    }

    /* ── Admin ── */
    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $resource = $seg[0] ?? null;
        $id       = isset($seg[1]) && is_numeric($seg[1]) ? (int)$seg[1] : null;
        $sub      = $seg[2] ?? null;

        match(true) {
            $method === 'GET' && $resource === 'estadisticas'               => $this->estadisticasGenerales(),
            $method === 'GET'                                                => $this->dimensionesConIndicadores(),
            $method === 'POST' && $resource === 'dimensiones'               => $this->crearDimension($user),
            $method === 'PUT'  && $resource === 'dimensiones' && $id        => $this->actualizarDimension($id, $user),
            $method === 'DELETE' && $resource === 'dimensiones' && $id      => $this->eliminarDimension($id),
            $method === 'POST' && $resource === 'indicadores'               => $this->crearIndicador($user),
            $method === 'PUT'  && $resource === 'indicadores' && $id        => $this->actualizarIndicador($id, $user),
            $method === 'DELETE' && $resource === 'indicadores' && $id      => $this->eliminarIndicador($id),
            $method === 'PATCH' && $resource === 'indicadores' && $id && $sub === 'progreso'
                                                                            => $this->actualizarProgreso($id, $user),
            default => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Dimensiones con indicadores ── */
    private function dimensionesConIndicadores(): void {
        $soloActivos = $_GET['activo'] ?? null;
        $where = $soloActivos !== null ? 'WHERE d.activo=' . (int)$soloActivos : '';

        $dims = $this->db->query(
            "SELECT * FROM dimensiones_monitoreo $where ORDER BY orden ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        foreach ($dims as &$dim) {
            $stmt = $this->db->prepare(
                'SELECT * FROM indicadores_monitoreo WHERE dimension_id=? AND activo=1 ORDER BY orden ASC'
            );
            $stmt->execute([$dim['id']]);
            $inds = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $dim['indicadores'] = array_map(function($ind) {
                foreach (['evidencias','momentos'] as $field) {
                    if (isset($ind[$field]) && is_string($ind[$field])) {
                        $ind[$field] = json_decode($ind[$field], true) ?? [];
                    }
                }
                return $ind;
            }, $inds);
        }

        $this->json($dims);
    }

    /* ── Estadísticas generales ── */
    private function estadisticasGenerales(): void {
        $totalInd = (int)$this->db->query(
            'SELECT COUNT(*) FROM indicadores_monitoreo WHERE activo=1'
        )->fetchColumn();

        $completados = (int)$this->db->query(
            'SELECT COUNT(*) FROM indicadores_monitoreo WHERE activo=1 AND actual >= meta'
        )->fetchColumn();

        $progresoRow = $this->db->query(
            'SELECT AVG(actual) FROM indicadores_monitoreo WHERE activo=1'
        )->fetchColumn();

        $dims = (int)$this->db->query(
            'SELECT COUNT(*) FROM dimensiones_monitoreo WHERE activo=1'
        )->fetchColumn();

        $this->json([
            'totalIndicadores'     => $totalInd,
            'indicadoresCompletados' => $completados,
            'progresoPromedio'     => round((float)$progresoRow, 1),
            'dimensiones'          => $dims,
        ]);
    }

    /* ── Dimensiones CRUD ── */
    private function crearDimension(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO dimensiones_monitoreo (nombre, color, icono, orden, activo)
             VALUES (:n,:c,:i,:o,:activo)'
        );
        $stmt->execute([
            'n'      => $data['nombre'] ?? '',
            'c'      => $data['color'] ?? '#4361ee',
            'i'      => $data['icono'] ?? 'ClipboardDataFill',
            'o'      => (int)($data['orden'] ?? 0),
            'activo' => 1,
        ]);
        $id = $this->db->lastInsertId();
        $row = $this->db->prepare('SELECT * FROM dimensiones_monitoreo WHERE id=?');
        $row->execute([$id]);
        $dim = $row->fetch(PDO::FETCH_ASSOC);
        $dim['indicadores'] = [];
        $this->json($dim, 201);
    }

    private function actualizarDimension(int $id, array $user): void {
        $data = $this->bodyData();
        $this->db->prepare(
            'UPDATE dimensiones_monitoreo SET nombre=:n, color=:c, icono=:i, orden=:o, activo=:activo WHERE id=:id'
        )->execute([
            'n'      => $data['nombre'] ?? '',
            'c'      => $data['color'] ?? '#4361ee',
            'i'      => $data['icono'] ?? 'ClipboardDataFill',
            'o'      => (int)($data['orden'] ?? 0),
            'activo' => (int)($data['activo'] ?? 1),
            'id'     => $id,
        ]);
        $row = $this->db->prepare('SELECT * FROM dimensiones_monitoreo WHERE id=?');
        $row->execute([$id]);
        $this->json($row->fetch(PDO::FETCH_ASSOC));
    }

    private function eliminarDimension(int $id): void {
        $this->db->prepare('DELETE FROM indicadores_monitoreo WHERE dimension_id=?')->execute([$id]);
        $this->db->prepare('DELETE FROM dimensiones_monitoreo WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Indicadores CRUD ── */
    private function crearIndicador(array $user): void {
        $data = $this->bodyData();

        $evidencias = is_array($data['evidencias'] ?? null)
            ? $data['evidencias'] : (json_decode($data['evidencias'] ?? '[]', true) ?? []);
        $momentos = is_array($data['momentos'] ?? null)
            ? $data['momentos'] : (json_decode($data['momentos'] ?? '[]', true) ?? []);

        $stmt = $this->db->prepare(
            'INSERT INTO indicadores_monitoreo (dimension_id, competencia, meta, actual, evidencias, momentos, orden, activo)
             VALUES (:dim,:comp,:meta,:actual,:ev,:mom,:ord,:activo)'
        );
        $stmt->execute([
            'dim'    => (int)($data['dimension_id'] ?? 0),
            'comp'   => $data['competencia'] ?? '',
            'meta'   => (int)($data['meta'] ?? 0),
            'actual' => (int)($data['actual'] ?? 0),
            'ev'     => json_encode($evidencias, JSON_UNESCAPED_UNICODE),
            'mom'    => json_encode($momentos, JSON_UNESCAPED_UNICODE),
            'ord'    => (int)($data['orden'] ?? 0),
            'activo' => 1,
        ]);
        $this->json(['id' => $this->db->lastInsertId(), 'ok' => true], 201);
    }

    private function actualizarIndicador(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM indicadores_monitoreo WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data = $this->bodyData();

        $evidencias = is_array($data['evidencias'] ?? null)
            ? $data['evidencias'] : (json_decode($data['evidencias'] ?? null, true) ?? json_decode($row['evidencias'] ?? '[]', true));
        $momentos = is_array($data['momentos'] ?? null)
            ? $data['momentos'] : (json_decode($data['momentos'] ?? null, true) ?? json_decode($row['momentos'] ?? '[]', true));

        $this->db->prepare(
            'UPDATE indicadores_monitoreo SET dimension_id=:dim, competencia=:comp, meta=:meta,
             actual=:actual, evidencias=:ev, momentos=:mom, orden=:ord, activo=:activo WHERE id=:id'
        )->execute([
            'dim'    => isset($data['dimension_id']) ? (int)$data['dimension_id'] : $row['dimension_id'],
            'comp'   => $data['competencia'] ?? $row['competencia'],
            'meta'   => isset($data['meta']) ? (int)$data['meta'] : $row['meta'],
            'actual' => isset($data['actual']) ? (int)$data['actual'] : $row['actual'],
            'ev'     => json_encode($evidencias, JSON_UNESCAPED_UNICODE),
            'mom'    => json_encode($momentos, JSON_UNESCAPED_UNICODE),
            'ord'    => isset($data['orden']) ? (int)$data['orden'] : $row['orden'],
            'activo' => isset($data['activo']) ? (int)$data['activo'] : $row['activo'],
            'id'     => $id,
        ]);
        $this->json(['ok' => true]);
    }

    private function eliminarIndicador(int $id): void {
        $this->db->prepare('DELETE FROM indicadores_monitoreo WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    private function actualizarProgreso(int $id, array $user): void {
        $data   = $this->bodyData();
        $actual = (int)($data['actual'] ?? $data['valor'] ?? 0);
        $this->db->prepare('UPDATE indicadores_monitoreo SET actual=? WHERE id=?')->execute([$actual, $id]);
        $this->json(['actual' => $actual]);
    }

    /* ── Helpers ── */
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
