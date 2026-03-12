<?php
require_once __DIR__ . '/../config/Database.php';

class InformeController {
    private PDO $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
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

        $resource = $seg[0] ?? null; // fases, resultados, logros, metadata
        $id       = isset($seg[1]) && is_numeric($seg[1]) ? (int)$seg[1] : null;

        match(true) {
            $method === 'GET'                                  => $this->obtenerCompleto(),
            $method === 'POST' && $resource === 'metadata'     => $this->upsertMetadata($user),
            $method === 'POST' && $resource === 'fases'        => $this->crearFase($user),
            $method === 'PUT'  && $resource === 'fases' && $id => $this->actualizarFase($id, $user),
            $method === 'DELETE' && $resource === 'fases' && $id => $this->eliminarFase($id),
            $method === 'POST' && $resource === 'resultados'   => $this->crearResultado($user),
            $method === 'PUT'  && $resource === 'resultados' && $id => $this->actualizarResultado($id, $user),
            $method === 'DELETE' && $resource === 'resultados' && $id => $this->eliminarResultado($id),
            $method === 'POST' && $resource === 'logros'       => $this->upsertLogros($user),
            default => $this->json(['error' => 'Ruta no válida'], 404),
        };
    }

    /* ── Informe completo ── */
    private function obtenerCompleto(): void {
        // Metadata
        $metaRaw = $this->db->query(
            'SELECT clave, valor FROM proyecto_fondep_metadata'
        )->fetchAll(PDO::FETCH_KEY_PAIR);

        $metadata = null;
        if (!empty($metaRaw)) {
            $metadata = [
                'codigo_proyecto' => $metaRaw['codigo_proyecto'] ?? '',
                'titulo'          => $metaRaw['titulo'] ?? '',
                'fecha_inicio'    => $metaRaw['fecha_inicio'] ?? '',
                'fecha_fin'       => $metaRaw['fecha_fin'] ?? '',
                'estado'          => $metaRaw['estado'] ?? 'en_proceso',
            ];
        }

        // Fases
        $fases = $this->db->query(
            'SELECT * FROM informe_fases ORDER BY orden ASC'
        )->fetchAll(PDO::FETCH_ASSOC);

        // Resultados
        $resultados = $this->db->query(
            'SELECT * FROM informe_resultados ORDER BY orden ASC'
        )->fetchAll(PDO::FETCH_ASSOC);

        // Mapear snake_case → camelCase para resultados
        $resultados = array_map(function($r) {
            return [
                'id'             => $r['id'],
                'tipo'           => $r['tipo'],
                'competencia'    => $r['competencia'],
                'metaDestacado'  => (float)$r['meta_destacado'],
                'metaProceso'    => (float)$r['meta_proceso'],
                'metaInicio'     => (float)$r['meta_inicio'],
                'inicioDestacado'=> (float)$r['inicio_destacado'],
                'inicioProceso'  => (float)$r['inicio_proceso'],
                'inicioInicio'   => (float)$r['inicio_inicio'],
                'actualDestacado'=> (float)$r['actual_destacado'],
                'actualProceso'  => (float)$r['actual_proceso'],
                'actualInicio'   => (float)$r['actual_inicio'],
                'color'          => $r['color'],
                'orden'          => (int)$r['orden'],
                'activo'         => (bool)$r['activo'],
            ];
        }, $resultados);

        // Logros
        $logrosRow = $this->db->query('SELECT * FROM informe_logros LIMIT 1')->fetch(PDO::FETCH_ASSOC);
        $logros = null;
        if ($logrosRow) {
            $logros = [
                'participacionEstudiantil' => (float)$logrosRow['participacion_estudiantil'],
                'docentesCapacitados'      => (float)$logrosRow['docentes_capacitados'],
                'productosGenerados'       => (int)$logrosRow['productos_generados'],
                'familiasInvolucradas'     => (float)$logrosRow['familias_involucradas'],
            ];
        }

        // Estadísticas
        $totalIndicadores = count($resultados);
        $metasAlcanzadas  = count(array_filter($resultados, fn($r) => $r['actualDestacado'] >= $r['metaDestacado']));
        $pct = $totalIndicadores > 0 ? round(($metasAlcanzadas / $totalIndicadores) * 100, 1) : 0;
        $mejora50 = count(array_filter($resultados, fn($r) => ($r['actualDestacado'] - $r['inicioDestacado']) >= 50));

        $this->json([
            'metadata'    => $metadata,
            'fases'       => $fases,
            'resultados'  => $resultados,
            'logros'      => $logros,
            'estadisticas' => [
                'totalIndicadores'         => $totalIndicadores,
                'metasAlcanzadas'          => $metasAlcanzadas,
                'porcentajeMetasAlcanzadas'=> $pct,
                'indicadoresMejora50'      => $mejora50,
            ],
        ]);
    }

    /* ── Metadata (upsert por clave) ── */
    private function upsertMetadata(array $user): void {
        $data = $this->bodyData();
        $claves = ['codigo_proyecto', 'titulo', 'fecha_inicio', 'fecha_fin', 'estado'];

        foreach ($claves as $clave) {
            if (!isset($data[$clave])) continue;
            $stmt = $this->db->prepare(
                'INSERT INTO proyecto_fondep_metadata (clave, valor, tipo) VALUES (:c,:v,:t)
                 ON DUPLICATE KEY UPDATE valor=:v'
            );
            $tipo = in_array($clave, ['fecha_inicio','fecha_fin']) ? 'fecha' : 'texto';
            $stmt->execute(['c' => $clave, 'v' => $data[$clave], 't' => $tipo]);
        }
        $this->json(['ok' => true]);
    }

    /* ── Fases ── */
    private function crearFase(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO informe_fases (fase, descripcion, completado, orden) VALUES (:f,:d,:c,:o)'
        );
        $stmt->execute([
            'f' => $data['fase'] ?? '',
            'd' => $data['descripcion'] ?? '',
            'c' => (int)($data['completado'] ?? 0),
            'o' => (int)($data['orden'] ?? 0),
        ]);
        $id = $this->db->lastInsertId();
        $row = $this->db->prepare('SELECT * FROM informe_fases WHERE id=?');
        $row->execute([$id]);
        $this->json($row->fetch(PDO::FETCH_ASSOC), 201);
    }

    private function actualizarFase(int $id, array $user): void {
        $data = $this->bodyData();
        $this->db->prepare(
            'UPDATE informe_fases SET fase=:f, descripcion=:d, completado=:c, orden=:o WHERE id=:id'
        )->execute([
            'f'  => $data['fase'] ?? '',
            'd'  => $data['descripcion'] ?? '',
            'c'  => (int)($data['completado'] ?? 0),
            'o'  => (int)($data['orden'] ?? 0),
            'id' => $id,
        ]);
        $row = $this->db->prepare('SELECT * FROM informe_fases WHERE id=?');
        $row->execute([$id]);
        $this->json($row->fetch(PDO::FETCH_ASSOC));
    }

    private function eliminarFase(int $id): void {
        $this->db->prepare('DELETE FROM informe_fases WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Resultados ── */
    private function crearResultado(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->prepare(
            'INSERT INTO informe_resultados
             (tipo, competencia, meta_destacado, meta_proceso, meta_inicio,
              inicio_destacado, inicio_proceso, inicio_inicio,
              actual_destacado, actual_proceso, actual_inicio, color, orden, activo)
             VALUES (:tipo,:comp,:md,:mp,:mi,:id_,:ip,:ii,:ad,:ap,:ai,:color,:ord,:activo)'
        );
        $stmt->execute([
            'tipo'  => $data['tipo'] ?? 'Aprendizaje',
            'comp'  => $data['competencia'] ?? '',
            'md'    => (float)($data['metaDestacado'] ?? 0),
            'mp'    => (float)($data['metaProceso'] ?? 0),
            'mi'    => (float)($data['metaInicio'] ?? 0),
            'id_'   => (float)($data['inicioDestacado'] ?? 0),
            'ip'    => (float)($data['inicioProceso'] ?? 0),
            'ii'    => (float)($data['inicioInicio'] ?? 0),
            'ad'    => (float)($data['actualDestacado'] ?? 0),
            'ap'    => (float)($data['actualProceso'] ?? 0),
            'ai'    => (float)($data['actualInicio'] ?? 0),
            'color' => $data['color'] ?? '#4361ee',
            'ord'   => (int)($data['orden'] ?? 0),
            'activo'=> (int)($data['activo'] ?? 1),
        ]);
        $this->json(['id' => $this->db->lastInsertId(), 'ok' => true], 201);
    }

    private function actualizarResultado(int $id, array $user): void {
        $data = $this->bodyData();
        $this->db->prepare(
            'UPDATE informe_resultados SET
             tipo=:tipo, competencia=:comp, meta_destacado=:md, meta_proceso=:mp, meta_inicio=:mi,
             inicio_destacado=:id_, inicio_proceso=:ip, inicio_inicio=:ii,
             actual_destacado=:ad, actual_proceso=:ap, actual_inicio=:ai,
             color=:color, orden=:ord, activo=:activo WHERE id=:id'
        )->execute([
            'tipo'  => $data['tipo'] ?? 'Aprendizaje',
            'comp'  => $data['competencia'] ?? '',
            'md'    => (float)($data['metaDestacado'] ?? 0),
            'mp'    => (float)($data['metaProceso'] ?? 0),
            'mi'    => (float)($data['metaInicio'] ?? 0),
            'id_'   => (float)($data['inicioDestacado'] ?? 0),
            'ip'    => (float)($data['inicioProceso'] ?? 0),
            'ii'    => (float)($data['inicioInicio'] ?? 0),
            'ad'    => (float)($data['actualDestacado'] ?? 0),
            'ap'    => (float)($data['actualProceso'] ?? 0),
            'ai'    => (float)($data['actualInicio'] ?? 0),
            'color' => $data['color'] ?? '#4361ee',
            'ord'   => (int)($data['orden'] ?? 0),
            'activo'=> (int)($data['activo'] ?? 1),
            'id'    => $id,
        ]);
        $this->json(['ok' => true]);
    }

    private function eliminarResultado(int $id): void {
        $this->db->prepare('DELETE FROM informe_resultados WHERE id=?')->execute([$id]);
        $this->json(['ok' => true]);
    }

    /* ── Logros destacados ── */
    private function upsertLogros(array $user): void {
        $data = $this->bodyData();
        $stmt = $this->db->query('SELECT id FROM informe_logros LIMIT 1');
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->db->prepare(
                'UPDATE informe_logros SET participacion_estudiantil=:pe, docentes_capacitados=:dc,
                 productos_generados=:pg, familias_involucradas=:fi WHERE id=:id'
            )->execute([
                'pe' => (float)($data['participacionEstudiantil'] ?? 0),
                'dc' => (float)($data['docentesCapacitados'] ?? 0),
                'pg' => (int)($data['productosGenerados'] ?? 0),
                'fi' => (float)($data['familiasInvolucradas'] ?? 0),
                'id' => $row['id'],
            ]);
        } else {
            $this->db->prepare(
                'INSERT INTO informe_logros (participacion_estudiantil, docentes_capacitados, productos_generados, familias_involucradas)
                 VALUES (:pe,:dc,:pg,:fi)'
            )->execute([
                'pe' => (float)($data['participacionEstudiantil'] ?? 0),
                'dc' => (float)($data['docentesCapacitados'] ?? 0),
                'pg' => (int)($data['productosGenerados'] ?? 0),
                'fi' => (float)($data['familiasInvolucradas'] ?? 0),
            ]);
        }
        $this->json(['ok' => true]);
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
