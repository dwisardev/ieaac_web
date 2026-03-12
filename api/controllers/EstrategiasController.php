<?php
require_once __DIR__ . '/../config/Database.php';

class EstrategiasController {
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
            'impacto' => $this->impactoTotal(),
            default   => $this->listar(),
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
            $method === 'GET'    && $sub === 'impacto' => $this->impactoTotal(),
            $method === 'GET'    && !$id               => $this->listarAdmin(),
            $method === 'GET'    && $id                => $this->mostrar($id),
            $method === 'POST'   && !$id               => $this->crear($user),
            $method === 'PUT'    && $id                => $this->actualizar($id, $user),
            $method === 'DELETE' && $id                => $this->eliminar($id),
            $method === 'PATCH'  && $id                => $this->toggleActivo($id),
            default                                    => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    private function listar(): void {
        $stmt = $this->db->query(
            'SELECT id, fase, descripcion, icono, color, beneficios,
                    impacto_aprendizaje, impacto_docencia, impacto_gestion, orden
             FROM estrategias_proyecto
             WHERE activo = 1
             ORDER BY orden ASC'
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->json(array_map([$this, 'formatRow'], $rows));
    }

    private function listarAdmin(): void {
        $stmt = $this->db->query('SELECT * FROM estrategias_proyecto ORDER BY orden ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->json(array_map([$this, 'formatRow'], $rows));
    }

    private function mostrar(int $id): void {
        $stmt = $this->db->prepare('SELECT * FROM estrategias_proyecto WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }
        $this->json($this->formatRow($row));
    }

    private function formatRow(array $row): array {
        $row['id']         = (int)$row['id'];
        $row['orden']      = (int)($row['orden'] ?? 0);
        $row['beneficios'] = !empty($row['beneficios']) ? json_decode($row['beneficios'], true) : [];
        $row['impacto']    = [
            'aprendizaje' => (int)($row['impacto_aprendizaje'] ?? 0),
            'docencia'    => (int)($row['impacto_docencia'] ?? 0),
            'gestion'     => (int)($row['impacto_gestion'] ?? 0),
        ];
        unset($row['impacto_aprendizaje'], $row['impacto_docencia'], $row['impacto_gestion']);
        return $row;
    }

    private function impactoTotal(): void {
        $stmt = $this->db->query(
            'SELECT AVG(impacto_aprendizaje) AS aprendizaje,
                    AVG(impacto_docencia)    AS docencia,
                    AVG(impacto_gestion)     AS gestion,
                    COUNT(*)                 AS totalEstrategias
             FROM estrategias_proyecto
             WHERE activo = 1'
        );
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->json([
            'aprendizaje'      => (int)round($row['aprendizaje'] ?? 0),
            'docencia'         => (int)round($row['docencia'] ?? 0),
            'gestion'          => (int)round($row['gestion'] ?? 0),
            'totalEstrategias' => (int)($row['totalEstrategias'] ?? 0),
        ]);
    }

    private function crear(array $user): void {
        $data = $this->bodyData();
        $impacto = $data['impacto'] ?? [];
        $stmt = $this->db->prepare(
            'INSERT INTO estrategias_proyecto
             (fase, descripcion, icono, color, beneficios, impacto_aprendizaje, impacto_docencia, impacto_gestion, orden, activo)
             VALUES (:fase, :descripcion, :icono, :color, :beneficios, :impacto_aprendizaje, :impacto_docencia, :impacto_gestion, :orden, :activo)'
        );
        $stmt->execute([
            'fase'                => $data['fase'] ?? '',
            'descripcion'         => $data['descripcion'] ?? null,
            'icono'               => $data['icono'] ?? 'GearFill',
            'color'               => $data['color'] ?? '#1a3a6e',
            'beneficios'          => json_encode($data['beneficios'] ?? []),
            'impacto_aprendizaje' => (int)($impacto['aprendizaje'] ?? 0),
            'impacto_docencia'    => (int)($impacto['docencia'] ?? 0),
            'impacto_gestion'     => (int)($impacto['gestion'] ?? 0),
            'orden'               => (int)($data['orden'] ?? 0),
            'activo'              => isset($data['activo']) ? (int)$data['activo'] : 1,
        ]);
        $this->json(['id' => (int)$this->db->lastInsertId()], 201);
    }

    private function actualizar(int $id, array $user): void {
        $data = $this->bodyData();
        $impacto = $data['impacto'] ?? [];
        $stmt = $this->db->prepare(
            'UPDATE estrategias_proyecto
             SET fase=:fase, descripcion=:descripcion, icono=:icono, color=:color,
                 beneficios=:beneficios, impacto_aprendizaje=:impacto_aprendizaje,
                 impacto_docencia=:impacto_docencia, impacto_gestion=:impacto_gestion,
                 orden=:orden, activo=:activo
             WHERE id=:id'
        );
        $stmt->execute([
            'fase'                => $data['fase'] ?? '',
            'descripcion'         => $data['descripcion'] ?? null,
            'icono'               => $data['icono'] ?? 'GearFill',
            'color'               => $data['color'] ?? '#1a3a6e',
            'beneficios'          => json_encode($data['beneficios'] ?? []),
            'impacto_aprendizaje' => (int)($impacto['aprendizaje'] ?? 0),
            'impacto_docencia'    => (int)($impacto['docencia'] ?? 0),
            'impacto_gestion'     => (int)($impacto['gestion'] ?? 0),
            'orden'               => (int)($data['orden'] ?? 0),
            'activo'              => isset($data['activo']) ? (int)$data['activo'] : 1,
            'id'                  => $id,
        ]);
        $this->json(['success' => true]);
    }

    private function eliminar(int $id): void {
        $this->db->prepare('UPDATE estrategias_proyecto SET activo=0 WHERE id=:id')->execute(['id' => $id]);
        $this->json(['success' => true]);
    }

    private function toggleActivo(int $id): void {
        $this->db->prepare('UPDATE estrategias_proyecto SET activo = 1-activo WHERE id=:id')->execute(['id' => $id]);
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
