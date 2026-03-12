<?php
/**
 * HorariosController.php
 * Gestión de horarios escolares (estudiantes y docentes)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class HorariosController
{
    private PDO   $db;
    private array $authUser = [];

    private array $diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /* ROUTER PÚBLICO */
    public function handlePublic(array $segments): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $sub    = $segments[1] ?? null;

        match (true) {
            $method === 'GET' && $sub === 'grados'   => $this->publicGrados(),
            $method === 'GET' && $sub === 'docentes'  => $this->publicDocentes(),
            $method === 'GET' && $sub === 'bloques'   => $this->publicBloques(),
            $method === 'GET' && $sub === 'estudiante' => $this->publicHorarioEstudiante(),
            $method === 'GET' && $sub === 'docente'    => $this->publicHorarioDocente(),
            $method === 'GET'                          => $this->publicResumen(),
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

        $sub = $segments[1] ?? null;
        $id  = isset($segments[2]) && is_numeric($segments[2]) ? (int)$segments[2] : null;
        if (is_numeric($sub)) { $id = (int)$sub; $sub = null; }

        match (true) {
            // Grados
            $method === 'GET'    && $sub === 'grados' && $id === null => $this->adminGrados(),
            $method === 'POST'   && $sub === 'grados'                  => $this->storeGrado(),
            $method === 'PUT'    && $sub === 'grados' && $id !== null  => $this->updateGrado($id),
            $method === 'DELETE' && $sub === 'grados' && $id !== null  => $this->destroyGrado($id),
            // Docentes (horario)
            $method === 'GET'    && $sub === 'docentes' && $id === null => $this->adminDocentes(),
            // Bloques
            $method === 'GET'    && $sub === 'bloques'                  => $this->publicBloques(),
            $method === 'POST'   && $sub === 'bloques'                  => $this->storeBloque(),
            $method === 'PUT'    && $sub === 'bloques' && $id !== null  => $this->updateBloque($id),
            $method === 'DELETE' && $sub === 'bloques' && $id !== null  => $this->destroyBloque($id),
            // Horarios estudiante
            $method === 'GET'    && $sub === 'estudiante'               => $this->publicHorarioEstudiante(),
            $method === 'POST'   && $sub === 'estudiante'               => $this->storeHorarioEstudiante(),
            // Horarios docente
            $method === 'GET'    && $sub === 'docente'                  => $this->publicHorarioDocente(),
            $method === 'POST'   && $sub === 'docente'                  => $this->storeHorarioDocente(),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══ GRADOS ══ */
    private function publicGrados(): void
    {
        $stmt = $this->db->prepare("SELECT id, nombre, nivel, orden FROM grados WHERE activo = 1 ORDER BY orden ASC");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function adminGrados(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM grados ORDER BY orden ASC");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function storeGrado(): void
    {
        $data = $this->parseBody();
        if (empty(trim($data['nombre'] ?? ''))) {
            $this->error('El nombre es requerido', 422); return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO grados (nombre, nivel, orden, activo, created_at, updated_at)
            VALUES (:nombre, :nivel, :orden, 1, NOW(), NOW())
        ");
        $stmt->execute([
            ':nombre' => $this->clean($data['nombre']),
            ':nivel'  => $this->clean($data['nivel']  ?? 'Secundaria'),
            ':orden'  => (int)($data['orden'] ?? 0),
        ]);

        $this->success(['message' => 'Grado creado', 'id' => (int)$this->db->lastInsertId()], 201);
    }

    private function updateGrado(int $id): void
    {
        $data = $this->parseBody();
        $stmt = $this->db->prepare("
            UPDATE grados SET nombre = :nombre, nivel = :nivel, orden = :orden, updated_at = NOW() WHERE id = :id
        ");
        $stmt->execute([
            ':nombre' => $this->clean($data['nombre'] ?? ''),
            ':nivel'  => $this->clean($data['nivel']  ?? 'Secundaria'),
            ':orden'  => (int)($data['orden']          ?? 0),
            ':id'     => $id,
        ]);
        $this->success(['message' => 'Grado actualizado']);
    }

    private function destroyGrado(int $id): void
    {
        $this->db->prepare("UPDATE grados SET activo = 0 WHERE id = :id")->execute([':id' => $id]);
        $this->success(['message' => 'Grado eliminado']);
    }

    /* ══ DOCENTES ══ */
    private function publicDocentes(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, nombre_completo, nombre_corto, especialidad, email, telefono, foto
            FROM   docentes
            WHERE  activo = 1
            ORDER  BY nombre_completo ASC
        ");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function adminDocentes(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM docentes ORDER BY nombre_completo ASC");
        $stmt->execute();
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    /* ══ BLOQUES ══ */
    private function publicBloques(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, hora, es_receso, orden FROM horarios_bloques WHERE activo = 1 ORDER BY orden ASC
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) {
            $row['id']        = (int)$row['id'];
            $row['orden']     = (int)$row['orden'];
            $row['es_receso'] = (bool)$row['es_receso'];
        }
        $this->success(['data' => $rows]);
    }

    private function storeBloque(): void
    {
        $data = $this->parseBody();
        $stmt = $this->db->prepare("
            INSERT INTO horarios_bloques (hora, es_receso, orden, activo)
            VALUES (:hora, :receso, :orden, 1)
        ");
        $stmt->execute([
            ':hora'   => $this->clean($data['hora']  ?? ''),
            ':receso' => (int)(bool)($data['es_receso'] ?? false),
            ':orden'  => (int)($data['orden'] ?? 0),
        ]);
        $this->success(['message' => 'Bloque creado', 'id' => (int)$this->db->lastInsertId()], 201);
    }

    private function updateBloque(int $id): void
    {
        $data = $this->parseBody();
        $stmt = $this->db->prepare("
            UPDATE horarios_bloques SET hora = :hora, es_receso = :receso, orden = :orden WHERE id = :id
        ");
        $stmt->execute([
            ':hora'   => $this->clean($data['hora']      ?? ''),
            ':receso' => (int)(bool)($data['es_receso']  ?? false),
            ':orden'  => (int)($data['orden']             ?? 0),
            ':id'     => $id,
        ]);
        $this->success(['message' => 'Bloque actualizado']);
    }

    private function destroyBloque(int $id): void
    {
        $this->db->prepare("DELETE FROM horarios_bloques WHERE id = :id")->execute([':id' => $id]);
        $this->success(['message' => 'Bloque eliminado']);
    }

    /* ══ HORARIO ESTUDIANTE ══ */
    private function publicHorarioEstudiante(): void
    {
        $gradoId = $_GET['grado_id'] ?? null;
        $anio    = $_GET['anio']     ?? date('Y');

        if (!$gradoId || !is_numeric($gradoId)) {
            $this->error('grado_id es requerido', 422); return;
        }

        $stmt = $this->db->prepare("
            SELECT he.id, he.dia_semana, he.es_receso,
                   hb.hora, hb.orden AS bloque_orden,
                   a.nombre AS asignatura, a.color AS asignatura_color,
                   d.nombre_corto AS docente
            FROM   horarios_estudiantes he
            JOIN   horarios_bloques hb ON he.bloque_id = hb.id
            LEFT   JOIN asignaturas a  ON he.asignatura_id = a.id
            LEFT   JOIN docentes d     ON he.docente_id = d.id
            WHERE  he.grado_id = :grado
              AND  he.anio_vigencia = :anio
              AND  he.activo = 1
            ORDER  BY hb.orden ASC, he.dia_semana ASC
        ");
        $stmt->execute([':grado' => (int)$gradoId, ':anio' => (int)$anio]);
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function storeHorarioEstudiante(): void
    {
        $data = $this->parseBody();

        // Insertar múltiples bloques de una vez
        $bloques = $data['bloques'] ?? [];

        if (empty($bloques)) {
            $this->error('Se requieren bloques de horario', 422); return;
        }

        // Borrar horario existente del grado/año
        $this->db->prepare("
            DELETE FROM horarios_estudiantes
            WHERE grado_id = :grado AND anio_vigencia = :anio
        ")->execute([
            ':grado' => (int)($data['grado_id'] ?? 0),
            ':anio'  => (int)($data['anio_vigencia'] ?? date('Y')),
        ]);

        $stmt = $this->db->prepare("
            INSERT INTO horarios_estudiantes
                (grado_id, bloque_id, dia_semana, asignatura_id, docente_id, es_receso, anio_vigencia, activo)
            VALUES
                (:grado, :bloque, :dia, :asig, :doc, :receso, :anio, 1)
        ");

        foreach ($bloques as $bloque) {
            if (!in_array($bloque['dia_semana'] ?? '', $this->diasValidos)) continue;
            $stmt->execute([
                ':grado'  => (int)($data['grado_id']       ?? 0),
                ':bloque' => (int)($bloque['bloque_id']    ?? 0),
                ':dia'    => $bloque['dia_semana'],
                ':asig'   => !empty($bloque['asignatura_id']) ? (int)$bloque['asignatura_id'] : null,
                ':doc'    => !empty($bloque['docente_id'])    ? (int)$bloque['docente_id']    : null,
                ':receso' => (int)(bool)($bloque['es_receso'] ?? false),
                ':anio'   => (int)($data['anio_vigencia']  ?? date('Y')),
            ]);
        }

        Security::logSecurityEvent('horario_estudiante_guardado', ['by' => $this->authUser['username'] ?? 'unknown']);
        $this->success(['message' => 'Horario de estudiante guardado correctamente'], 201);
    }

    /* ══ HORARIO DOCENTE ══ */
    private function publicHorarioDocente(): void
    {
        $docenteId = $_GET['docente_id'] ?? null;
        $anio      = $_GET['anio']       ?? date('Y');

        if (!$docenteId || !is_numeric($docenteId)) {
            $this->error('docente_id es requerido', 422); return;
        }

        $stmt = $this->db->prepare("
            SELECT hd.id, hd.dia_semana, hd.es_receso,
                   hb.hora, hb.orden AS bloque_orden,
                   a.nombre AS asignatura, a.color AS asignatura_color,
                   g.nombre AS grado
            FROM   horarios_docentes hd
            JOIN   horarios_bloques hb ON hd.bloque_id = hb.id
            LEFT   JOIN asignaturas a  ON hd.asignatura_id = a.id
            LEFT   JOIN grados g       ON hd.grado_id = g.id
            WHERE  hd.docente_id = :docente
              AND  hd.anio_vigencia = :anio
              AND  hd.activo = 1
            ORDER  BY hb.orden ASC, hd.dia_semana ASC
        ");
        $stmt->execute([':docente' => (int)$docenteId, ':anio' => (int)$anio]);
        $this->success(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    private function storeHorarioDocente(): void
    {
        $data    = $this->parseBody();
        $bloques = $data['bloques'] ?? [];

        if (empty($bloques)) {
            $this->error('Se requieren bloques de horario', 422); return;
        }

        $this->db->prepare("
            DELETE FROM horarios_docentes
            WHERE docente_id = :doc AND anio_vigencia = :anio
        ")->execute([
            ':doc'  => (int)($data['docente_id']    ?? 0),
            ':anio' => (int)($data['anio_vigencia'] ?? date('Y')),
        ]);

        $stmt = $this->db->prepare("
            INSERT INTO horarios_docentes
                (docente_id, bloque_id, dia_semana, asignatura_id, grado_id, es_receso, anio_vigencia, activo)
            VALUES
                (:docente, :bloque, :dia, :asig, :grado, :receso, :anio, 1)
        ");

        foreach ($bloques as $bloque) {
            if (!in_array($bloque['dia_semana'] ?? '', $this->diasValidos)) continue;
            $stmt->execute([
                ':docente' => (int)($data['docente_id']     ?? 0),
                ':bloque'  => (int)($bloque['bloque_id']    ?? 0),
                ':dia'     => $bloque['dia_semana'],
                ':asig'    => !empty($bloque['asignatura_id']) ? (int)$bloque['asignatura_id'] : null,
                ':grado'   => !empty($bloque['grado_id'])      ? (int)$bloque['grado_id']      : null,
                ':receso'  => (int)(bool)($bloque['es_receso']  ?? false),
                ':anio'    => (int)($data['anio_vigencia']   ?? date('Y')),
            ]);
        }

        Security::logSecurityEvent('horario_docente_guardado', ['by' => $this->authUser['username'] ?? 'unknown']);
        $this->success(['message' => 'Horario de docente guardado correctamente'], 201);
    }

    /* ══ RESUMEN ══ */
    private function publicResumen(): void
    {
        $grados  = $this->db->query("SELECT id, nombre FROM grados WHERE activo = 1 ORDER BY orden ASC")->fetchAll(PDO::FETCH_ASSOC);
        $bloques = $this->db->query("SELECT id, hora, es_receso, orden FROM horarios_bloques WHERE activo = 1 ORDER BY orden ASC")->fetchAll(PDO::FETCH_ASSOC);

        $this->success(['data' => [
            'grados'  => $grados,
            'bloques' => $bloques,
        ]]);
    }

    /* ══ HELPERS ══ */
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
