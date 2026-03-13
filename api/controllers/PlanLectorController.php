<?php
require_once __DIR__ . '/../config/Database.php';

class PlanLectorController {
    private PDO $db;
    private string $uploadDir;

    public function __construct() {
        $this->db = (new Database())->getConnection();
        $this->uploadDir = __DIR__ . '/../../public/uploads/plan-lector/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0775, true);
    }

    /* ── Pública ── */
    public function handlePublic(array $seg): void {
        match($_SERVER['REQUEST_METHOD']) {
            'GET'  => $this->obtenerCompleto(),
            default => $this->json(['error' => 'Método no permitido'], 405),
        };
    }

    /* ── Admin ── */
    public function handle(array $seg, array $user): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $spoof  = $_POST['_method'] ?? $_GET['_method'] ?? null;
        if ($method === 'POST' && $spoof) $method = strtoupper($spoof);

        $resource = $seg[0] ?? null;
        $id       = isset($seg[1]) && is_numeric($seg[1]) ? (int)$seg[1] : null;

        match(true) {
            $method === 'GET'                                          => $this->obtenerCompleto(),
            $method === 'POST'   && $resource === 'config'             => $this->upsertConfig($user),
            $method === 'DELETE' && $resource === 'config'             => $this->eliminarConfig(),
            $method === 'PATCH'  && $resource === 'config'             => $this->desactivarConfig(),
            $method === 'POST'   && $resource === 'metas'              => $this->crearMeta($user),
            $method === 'PUT'    && $resource === 'metas' && $id       => $this->actualizarMeta($id, $user),
            $method === 'DELETE' && $resource === 'metas' && $id       => $this->eliminarMeta($id),
            $method === 'POST'   && $resource === 'cronograma'         => $this->crearCronograma($user),
            $method === 'PUT'    && $resource === 'cronograma' && $id  => $this->actualizarCronograma($id, $user),
            $method === 'DELETE' && $resource === 'cronograma' && $id  => $this->eliminarCronograma($id),
            $method === 'POST'   && $resource === 'libros'             => $this->crearLibro($user),
            $method === 'PUT'    && $resource === 'libros' && $id      => $this->actualizarLibro($id, $user),
            $method === 'DELETE' && $resource === 'libros' && $id      => $this->eliminarLibro($id),
            default => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Plan completo ── */
    private function obtenerCompleto(): void {
        $anio = (int)($_GET['anio'] ?? date('Y'));

        // Configuración
        $stmt = $this->db->prepare('SELECT * FROM plan_lector_config WHERE anio_escolar=? AND activo=1 LIMIT 1');
        $stmt->execute([$anio]);
        $config = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        // Metas
        $stmt2 = $this->db->prepare('SELECT * FROM plan_lector_metas WHERE anio_escolar=? AND activo=1 ORDER BY orden ASC');
        $stmt2->execute([$anio]);
        $metas = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        // Cronograma con actividades
        $stmt3 = $this->db->prepare('SELECT * FROM plan_lector_cronograma WHERE anio_escolar=? AND activo=1 ORDER BY orden_mes ASC');
        $stmt3->execute([$anio]);
        $cronRaw = $stmt3->fetchAll(PDO::FETCH_ASSOC);

        $cronograma = [];
        foreach ($cronRaw as $cron) {
            $acts = $this->db->prepare('SELECT actividad FROM plan_lector_actividades WHERE cronograma_id=? AND activo=1 ORDER BY orden ASC');
            $acts->execute([$cron['id']]);
            $cron['actividades'] = array_column($acts->fetchAll(PDO::FETCH_ASSOC), 'actividad');
            $cronograma[] = $cron;
        }

        // Libros por grado
        $stmt4 = $this->db->prepare(
            'SELECT pl.*, g.nombre as grado FROM plan_lector_libros pl
             JOIN grados g ON pl.grado_id = g.id
             WHERE pl.anio_escolar=? AND pl.activo=1
             ORDER BY pl.grado_id ASC, pl.orden ASC'
        );
        $stmt4->execute([$anio]);
        $librosRaw = $stmt4->fetchAll(PDO::FETCH_ASSOC);

        // Agrupar por grado
        $librosPorGrado = [];
        foreach ($librosRaw as $libro) {
            $gKey = $libro['grado_id'];
            if (!isset($librosPorGrado[$gKey])) {
                $librosPorGrado[$gKey] = [
                    'grado_id' => $libro['grado_id'],
                    'grado'    => $libro['grado'],
                    'obras'    => [],
                ];
            }
            $librosPorGrado[$gKey]['obras'][] = [
                'id'       => $libro['id'],
                'titulo'   => $libro['titulo'],
                'autor'    => $libro['autor'],
                'archivo'  => $libro['archivo_url'],
                'orden'    => (int)$libro['orden'],
                'anio'     => (int)$libro['anio_escolar'],
            ];
        }

        $this->json([
            'configuracion'  => $config,
            'metas'          => $metas,
            'cronograma'     => $cronograma,
            'librosPorGrado' => array_values($librosPorGrado),
        ]);
    }

    /* ── Configuración ── */
    private function upsertConfig(array $user): void {
        $data = $this->bodyData();
        $anio = (int)($data['anio_escolar'] ?? date('Y'));

        $stmt = $this->db->prepare('SELECT id FROM plan_lector_config WHERE anio_escolar=?');
        $stmt->execute([$anio]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->db->prepare(
                'UPDATE plan_lector_config SET director=:d, codigo_modular=:c, lema=:l, descripcion=:desc WHERE id=:id'
            )->execute([
                'd'    => $data['director'] ?? null,
                'c'    => $data['codigo_modular'] ?? null,
                'l'    => $data['lema'] ?? null,
                'desc' => $data['descripcion'] ?? null,
                'id'   => $row['id'],
            ]);
        } else {
            $this->db->prepare(
                'INSERT INTO plan_lector_config (anio_escolar, director, codigo_modular, lema, descripcion)
                 VALUES (:anio,:d,:c,:l,:desc)'
            )->execute([
                'anio' => $anio,
                'd'    => $data['director'] ?? null,
                'c'    => $data['codigo_modular'] ?? null,
                'l'    => $data['lema'] ?? null,
                'desc' => $data['descripcion'] ?? null,
            ]);
        }
        $this->json(['ok' => true]);
    }

    private function eliminarConfig(): void {
        $anio = (int)($_GET['anio'] ?? date('Y'));
        $this->db->prepare('DELETE FROM plan_lector_config WHERE anio_escolar=?')->execute([$anio]);
        $this->json(['ok' => true]);
    }

    private function desactivarConfig(): void {
        $anio = (int)($_GET['anio'] ?? date('Y'));
        $this->db->prepare('UPDATE plan_lector_config SET activo=0 WHERE anio_escolar=?')->execute([$anio]);
        $this->json(['ok' => true]);
    }

    /* ── Metas ── */
    private function crearMeta(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO plan_lector_metas (meta, orden, anio_escolar) VALUES (:m,:o,:a)'
        );
        $stmt->execute([
            'm' => $data['meta'] ?? '',
            'o' => (int)($data['orden'] ?? 1),
            'a' => (int)($data['anio'] ?? date('Y')),
        ]);
        $id = $this->db->lastInsertId();
        $row = $this->db->prepare('SELECT * FROM plan_lector_metas WHERE id=?');
        $row->execute([$id]);
        $this->json($row->fetch(PDO::FETCH_ASSOC), 201);
    }

    private function actualizarMeta(int $id, array $user): void {
        $data = $this->bodyData();
        $this->db->prepare(
            'UPDATE plan_lector_metas SET meta=:m, orden=:o, anio_escolar=:a WHERE id=:id'
        )->execute([
            'm'  => $data['meta'] ?? '',
            'o'  => (int)($data['orden'] ?? 1),
            'a'  => (int)($data['anio'] ?? date('Y')),
            'id' => $id,
        ]);
        $row = $this->db->prepare('SELECT * FROM plan_lector_metas WHERE id=?');
        $row->execute([$id]);
        $this->json($row->fetch(PDO::FETCH_ASSOC));
    }

    private function eliminarMeta(int $id): void {
        $this->db->prepare('DELETE FROM plan_lector_metas WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Cronograma ── */
    private function crearCronograma(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO plan_lector_cronograma (mes, orden_mes, responsable, anio_escolar) VALUES (:m,:o,:r,:a)'
        );
        $stmt->execute([
            'm' => $data['mes'] ?? '',
            'o' => (int)($data['orden_mes'] ?? 1),
            'r' => $data['responsable'] ?? '',
            'a' => (int)($data['anio'] ?? date('Y')),
        ]);
        $cronId = (int)$this->db->lastInsertId();

        // Guardar actividades
        $actividades = is_array($data['actividades'] ?? null)
            ? $data['actividades']
            : (json_decode($data['actividades'] ?? '[]', true) ?? []);

        foreach ($actividades as $i => $act) {
            $this->db->prepare(
                'INSERT INTO plan_lector_actividades (cronograma_id, actividad, orden) VALUES (?,?,?)'
            )->execute([$cronId, $act, $i + 1]);
        }

        $row = $this->db->prepare('SELECT * FROM plan_lector_cronograma WHERE id=?');
        $row->execute([$cronId]);
        $cron = $row->fetch(PDO::FETCH_ASSOC);
        $cron['actividades'] = $actividades;
        $this->json($cron, 201);
    }

    private function actualizarCronograma(int $id, array $user): void {
        $data = $this->bodyData();
        $this->db->prepare(
            'UPDATE plan_lector_cronograma SET mes=:m, orden_mes=:o, responsable=:r, anio_escolar=:a WHERE id=:id'
        )->execute([
            'm'  => $data['mes'] ?? '',
            'o'  => (int)($data['orden_mes'] ?? 1),
            'r'  => $data['responsable'] ?? '',
            'a'  => (int)($data['anio'] ?? date('Y')),
            'id' => $id,
        ]);

        // Actualizar actividades: borrar y re-insertar
        $this->db->prepare('DELETE FROM plan_lector_actividades WHERE cronograma_id=?')->execute([$id]);
        $actividades = is_array($data['actividades'] ?? null)
            ? $data['actividades']
            : (json_decode($data['actividades'] ?? '[]', true) ?? []);

        foreach ($actividades as $i => $act) {
            $this->db->prepare(
                'INSERT INTO plan_lector_actividades (cronograma_id, actividad, orden) VALUES (?,?,?)'
            )->execute([$id, $act, $i + 1]);
        }
        $this->json(['ok' => true]);
    }

    private function eliminarCronograma(int $id): void {
        $this->db->prepare('DELETE FROM plan_lector_actividades WHERE cronograma_id=?')->execute([$id]);
        $this->db->prepare('DELETE FROM plan_lector_cronograma WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Libros ── */
    private function crearLibro(array $user): void {
        $data = $this->bodyData();
        $archUrl = $this->subirPdf();

        $stmt = $this->db->prepare(
            'INSERT INTO plan_lector_libros (grado_id, titulo, autor, archivo_url, orden, anio_escolar)
             VALUES (:g,:t,:a,:url,:o,:anio)'
        );
        $stmt->execute([
            'g'    => (int)($data['grado_id'] ?? 1),
            't'    => $data['titulo'] ?? '',
            'a'    => $data['autor'] ?? '',
            'url'  => $archUrl,
            'o'    => (int)($data['orden'] ?? 1),
            'anio' => (int)($data['anio'] ?? date('Y')),
        ]);
        $this->json(['id' => $this->db->lastInsertId(), 'ok' => true], 201);
    }

    private function actualizarLibro(int $id, array $user): void {
        $stmt = $this->db->prepare('SELECT * FROM plan_lector_libros WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) { $this->json(['error' => 'No encontrado'], 404); return; }

        $data    = $this->bodyData();
        $archUrl = $this->subirPdf() ?? $row['archivo_url'];

        $this->db->prepare(
            'UPDATE plan_lector_libros SET grado_id=:g, titulo=:t, autor=:a, archivo_url=:url, orden=:o, anio_escolar=:anio WHERE id=:id'
        )->execute([
            'g'    => (int)($data['grado_id'] ?? $row['grado_id']),
            't'    => $data['titulo'] ?? $row['titulo'],
            'a'    => $data['autor'] ?? $row['autor'],
            'url'  => $archUrl,
            'o'    => isset($data['orden']) ? (int)$data['orden'] : $row['orden'],
            'anio' => isset($data['anio']) ? (int)$data['anio'] : $row['anio_escolar'],
            'id'   => $id,
        ]);
        $this->json(['ok' => true]);
    }

    private function eliminarLibro(int $id): void {
        $stmt = $this->db->prepare('SELECT archivo_url FROM plan_lector_libros WHERE id=?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['archivo_url']) {
            $path = $this->uploadDir . basename($row['archivo_url']);
            if (file_exists($path)) unlink($path);
        }
        $this->db->prepare('DELETE FROM plan_lector_libros WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Helpers ── */
    private function subirPdf(): ?string {
        if (empty($_FILES['archivo']['tmp_name'])) return null;
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($_FILES['archivo']['tmp_name']);
        if ($mime !== 'application/pdf') return null;
        $name = uniqid('plan_', true) . '.pdf';
        if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $this->uploadDir . $name)) return null;
        return '/public/uploads/plan-lector/' . $name;
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
