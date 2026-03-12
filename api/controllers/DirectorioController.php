<?php
/**
 * DirectorioController.php
 * Gestión del directorio del personal docente y administrativo
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class DirectorioController
{
    private PDO   $db;
    private array $authUser = [];

    private array $cargosValidos = ['Director', 'Subdirector', 'Docente', 'Auxiliar Ed.', 'Administrativo'];

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /* ROUTER PÚBLICO */
    public function handlePublic(array $segments): void
    {
        match ($_SERVER['REQUEST_METHOD']) {
            'GET'   => $this->publicList(),
            default => $this->error('Método no permitido', 405),
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

        $id = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;

        match (true) {
            $method === 'GET'    && $id === null => $this->adminList(),
            $method === 'GET'    && $id !== null => $this->adminShow($id),
            $method === 'POST'   && $id === null => $this->store(),
            $method === 'PUT'    && $id !== null => $this->update($id),
            $method === 'DELETE' && $id !== null => $this->destroy($id),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* GET /api/directorio — lista pública (activos, ordenados) */
    private function publicList(): void
    {
        $stmt = $this->db->prepare("
            SELECT id, nombres, apellidos, area, cargo, fecha_nacimiento,
                   celular, correo, direccion, foto, orden
            FROM   directorio
            WHERE  activo = 1
            ORDER  BY orden ASC, cargo ASC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    /* ADMIN LIST — todos */
    private function adminList(): void
    {
        $stmt = $this->db->prepare("
            SELECT * FROM directorio ORDER BY orden ASC
        ");
        $stmt->execute();
        $rows = array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        $this->success(['data' => $rows]);
    }

    private function adminShow(int $id): void
    {
        $row = $this->findById($id);
        if (!$row) { $this->error('Personal no encontrado', 404); return; }
        $this->success(['data' => $this->formatRow($row)]);
    }

    /* POST — crear */
    private function store(): void
    {
        $data = $this->parseBody();

        if (empty(trim($data['nombres'] ?? ''))) {
            $this->error('Los nombres son requeridos', 422); return;
        }
        if (empty(trim($data['apellidos'] ?? ''))) {
            $this->error('Los apellidos son requeridos', 422); return;
        }

        $cargo = $data['cargo'] ?? 'Docente';
        if (!in_array($cargo, $this->cargosValidos)) {
            $this->error('Cargo inválido', 422); return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO directorio
                (nombres, apellidos, area, cargo, fecha_nacimiento, celular, correo, direccion, foto, orden, activo, created_at, updated_at)
            VALUES
                (:nombres, :apellidos, :area, :cargo, :fecha_nacimiento, :celular, :correo, :direccion, :foto, :orden, :activo, NOW(), NOW())
        ");
        $stmt->execute([
            ':nombres'          => $this->clean($data['nombres']),
            ':apellidos'        => $this->clean($data['apellidos']),
            ':area'             => $this->clean($data['area']      ?? ''),
            ':cargo'            => $cargo,
            ':fecha_nacimiento' => !empty($data['fecha_nacimiento']) ? $data['fecha_nacimiento'] : null,
            ':celular'          => $this->clean($data['celular']   ?? ''),
            ':correo'           => $this->clean($data['correo']    ?? ''),
            ':direccion'        => $this->clean($data['direccion'] ?? ''),
            ':foto'             => $this->clean($data['foto']      ?? ''),
            ':orden'            => (int)($data['orden'] ?? 0),
            ':activo'           => isset($data['activo']) ? (int)(bool)$data['activo'] : 1,
        ]);

        $newId = (int)$this->db->lastInsertId();
        Security::logSecurityEvent('directorio_created', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $newId]);
        $this->success(['message' => 'Personal creado correctamente', 'id' => $newId], 201);
    }

    /* PUT — actualizar */
    private function update(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Personal no encontrado', 404); return; }

        $data  = $this->parseBody();
        $cargo = $data['cargo'] ?? $existing['cargo'];
        if (!in_array($cargo, $this->cargosValidos)) {
            $this->error('Cargo inválido', 422); return;
        }

        $stmt = $this->db->prepare("
            UPDATE directorio SET
                nombres          = :nombres,
                apellidos        = :apellidos,
                area             = :area,
                cargo            = :cargo,
                fecha_nacimiento = :fecha_nacimiento,
                celular          = :celular,
                correo           = :correo,
                direccion        = :direccion,
                foto             = :foto,
                orden            = :orden,
                activo           = :activo,
                updated_at       = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':nombres'          => $this->clean($data['nombres']   ?? $existing['nombres']),
            ':apellidos'        => $this->clean($data['apellidos'] ?? $existing['apellidos']),
            ':area'             => $this->clean($data['area']      ?? $existing['area']      ?? ''),
            ':cargo'            => $cargo,
            ':fecha_nacimiento' => $data['fecha_nacimiento'] ?? $existing['fecha_nacimiento'],
            ':celular'          => $this->clean($data['celular']   ?? $existing['celular']   ?? ''),
            ':correo'           => $this->clean($data['correo']    ?? $existing['correo']    ?? ''),
            ':direccion'        => $this->clean($data['direccion'] ?? $existing['direccion'] ?? ''),
            ':foto'             => $this->clean($data['foto']      ?? $existing['foto']      ?? ''),
            ':orden'            => (int)($data['orden'] ?? $existing['orden']),
            ':activo'           => isset($data['activo']) ? (int)(bool)$data['activo'] : (int)$existing['activo'],
            ':id'               => $id,
        ]);

        Security::logSecurityEvent('directorio_updated', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Personal actualizado correctamente']);
    }

    /* DELETE — eliminar */
    private function destroy(int $id): void
    {
        $existing = $this->findById($id);
        if (!$existing) { $this->error('Personal no encontrado', 404); return; }

        $this->db->prepare("DELETE FROM directorio WHERE id = :id")->execute([':id' => $id]);

        Security::logSecurityEvent('directorio_deleted', ['by' => $this->authUser['username'] ?? 'unknown', 'id' => $id]);
        $this->success(['message' => 'Personal eliminado correctamente']);
    }

    /* HELPERS */
    private function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM directorio WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function formatRow(array $row): array
    {
        $row['id']     = (int)$row['id'];
        $row['orden']  = (int)$row['orden'];
        $row['activo'] = isset($row['activo']) ? (bool)$row['activo'] : true;
        return $row;
    }

    /** Parsear body JSON o multipart/POST */
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
        $r = ['success' => false, 'error' => $message];
        if ($errors) $r['errors'] = $errors;
        echo json_encode($r, JSON_UNESCAPED_UNICODE);
        exit();
    }
}
