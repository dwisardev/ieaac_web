<?php
/**
 * FileUpload - Gestión centralizada de subida de archivos
 * I.E. Andrés Avelino Cáceres
 *
 * Uso:
 *   $uploader = new FileUpload('noticias');
 *   $nombre   = $uploader->upload($_FILES['imagen']);
 *   $url      = $uploader->getUrl($nombre);
 */

class FileUpload
{
    private string $uploadDir;
    private string $uploadUrl;
    private int    $maxSize;
    private array  $allowedMime;

    /**
     * @param string $subDir  Subdirectorio dentro de uploads/ (ej: 'noticias', 'comunicados')
     * @param string $types   'images' | 'pdf' | 'all'
     */
    public function __construct(string $subDir = '', string $types = 'images')
    {
        // Ruta física: public_html/public/uploads/{subDir}/
        // (misma base que NoticiasController: __DIR__/../../public/uploads/)
        $this->uploadDir = __DIR__ . '/../../public/uploads/' . trim($subDir, '/') . '/';

        // URL pública
        $proto           = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host            = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $this->uploadUrl = "{$proto}://{$host}/uploads/" . trim($subDir, '/') . '/';

        // Tamaño máximo desde .env (default 10 MB)
        $this->maxSize = (int)($_ENV['UPLOAD_MAX_SIZE'] ?? 10485760);

        // MIME types permitidos
        $imageTypes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];
        $pdfTypes = [
            'application/pdf' => 'pdf',
        ];

        $this->allowedMime = match ($types) {
            'pdf'   => $pdfTypes,
            'all'   => array_merge($imageTypes, $pdfTypes),
            default => $imageTypes,
        };
    }

    /**
     * Subir archivo al servidor.
     *
     * @param  array        $file  Elemento de $_FILES
     * @return string|false        Nombre del archivo guardado, o false si falla
     */
    public function upload(array $file): string|false
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            error_log('[UPLOAD] Error en subida: código ' . $file['error']);
            return false;
        }

        if ($file['size'] > $this->maxSize) {
            error_log('[UPLOAD] Archivo demasiado grande: ' . $file['size'] . ' bytes (máx ' . $this->maxSize . ')');
            return false;
        }

        // Verificar MIME real (no la extensión declarada por el cliente)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime  = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, $this->allowedMime)) {
            error_log('[UPLOAD] MIME no permitido: ' . $mime);
            return false;
        }

        // Crear directorio si no existe
        if (!is_dir($this->uploadDir)) {
            if (!mkdir($this->uploadDir, 0755, true)) {
                error_log('[UPLOAD] No se pudo crear directorio: ' . $this->uploadDir);
                return false;
            }
        }

        // Nombre aleatorio + extensión real del MIME verificado
        $ext     = $this->allowedMime[$mime];
        $nombre  = bin2hex(random_bytes(16)) . '_' . time() . '.' . $ext;
        $destino = $this->uploadDir . $nombre;

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            error_log('[UPLOAD] move_uploaded_file falló. Destino: ' . $destino);
            return false;
        }

        return $nombre;
    }

    /**
     * Eliminar un archivo del servidor.
     */
    public function delete(string $filename): bool
    {
        if (empty($filename)) return false;

        $path = $this->uploadDir . basename($filename);
        if (file_exists($path)) {
            return unlink($path);
        }
        return false;
    }

    /**
     * URL pública completa de un archivo.
     */
    public function getUrl(string $filename): string
    {
        return $this->uploadUrl . $filename;
    }

    /**
     * Ruta física del directorio de uploads.
     */
    public function getDir(): string
    {
        return $this->uploadDir;
    }
}
