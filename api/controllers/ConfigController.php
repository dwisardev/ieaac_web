<?php
/**
 * ConfigController.php
 * Gestión de configuración institucional:
 *   - informacion_institucional (PUT /admin/config/informacion)
 *   - proyecto_fondep_metadata  (GET/PUT /admin/config/metadata)
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Security.php';

class ConfigController
{
    private PDO   $db;
    private array $authUser = [];

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /* ══════════════════════════════════════════════════
       ROUTER ADMIN
       Segmentos recibidos: [0]=config, [1]=subrecurso
    ══════════════════════════════════════════════════ */
    public function handle(array $segments, array $authUser): void
    {
        $this->authUser = $authUser;

        $method = $_SERVER['REQUEST_METHOD'];

        $sub = $segments[1] ?? null;  // 'informacion' | 'metadata'

        match (true) {
            $method === 'GET'  && $sub === 'informacion' => $this->getInformacion(),
            $method === 'PUT'  && $sub === 'informacion' => $this->updateInformacion(),
            $method === 'GET'  && $sub === 'metadata'    => $this->getMetadata(),
            $method === 'PUT'  && $sub === 'metadata'    => $this->updateMetadata(),
            default => $this->error('Ruta no encontrada', 404),
        };
    }

    /* ══════════════════════════════════════════════════
       GET /admin/config/informacion
    ══════════════════════════════════════════════════ */
    private function getInformacion(): void
    {
        $stmt = $this->db->query("SELECT * FROM informacion_institucional WHERE activo = 1 LIMIT 1");
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->success(['data' => $row ?: null]);
    }

    /* ══════════════════════════════════════════════════
       PUT /admin/config/informacion
    ══════════════════════════════════════════════════ */
    private function updateInformacion(): void
    {
        $raw   = file_get_contents('php://input');
        $input = $raw ? (json_decode($raw, true) ?? []) : $_POST;

        $campos = ['nombre', 'codigo_modular', 'director', 'ubicacion',
                   'telefono', 'email', 'anio_vigencia',
                   'grados_atendidos', 'nivel_educativo', 'tipo_gestion'];

        $sets   = [];
        $params = [];
        foreach ($campos as $c) {
            if (isset($input[$c])) {
                $sets[]    = "`$c` = :$c";
                $params[":$c"] = trim($input[$c]);
            }
        }

        if (empty($sets)) { $this->error('Sin datos para actualizar', 422); return; }

        $this->db->prepare(
            "UPDATE informacion_institucional SET " . implode(', ', $sets) . " WHERE activo = 1"
        )->execute($params);

        Security::logSecurityEvent('config_informacion_updated', ['by' => $this->authUser['username'] ?? 'admin']);
        $this->success(['message' => 'Información institucional actualizada']);
    }

    /* ══════════════════════════════════════════════════
       GET /admin/config/metadata
    ══════════════════════════════════════════════════ */
    private function getMetadata(): void
    {
        $stmt = $this->db->query("SELECT clave, valor, tipo, descripcion FROM proyecto_fondep_metadata ORDER BY clave");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->success(['data' => $rows]);
    }

    /* ══════════════════════════════════════════════════
       PUT /admin/config/metadata
       Body: { "clave": "nombre_clave", "valor": "nuevo valor" }
    ══════════════════════════════════════════════════ */
    private function updateMetadata(): void
    {
        $raw   = file_get_contents('php://input');
        $input = $raw ? (json_decode($raw, true) ?? []) : $_POST;

        $clave = trim($input['clave'] ?? '');
        $valor = trim($input['valor'] ?? '');

        if (!$clave) { $this->error('La clave es requerida', 422); return; }

        // Verificar que la clave existe
        $check = $this->db->prepare("SELECT id FROM proyecto_fondep_metadata WHERE clave = :c LIMIT 1");
        $check->execute([':c' => $clave]);
        if (!$check->fetch()) { $this->error('Clave no encontrada', 404); return; }

        $this->db->prepare(
            "UPDATE proyecto_fondep_metadata SET valor = :v, updated_at = NOW() WHERE clave = :c"
        )->execute([':v' => $valor, ':c' => $clave]);

        Security::logSecurityEvent('config_metadata_updated', ['by' => $this->authUser['username'] ?? 'admin', 'clave' => $clave]);
        $this->success(['message' => "Metadato '$clave' actualizado"]);
    }

    /* ── Helpers ── */
    private function success(array $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function error(string $message, int $code = 400): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
