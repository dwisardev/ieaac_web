<?php
/**
 * Middleware Validate - Validación reutilizable de datos de entrada
 * I.E. Andrés Avelino Cáceres
 *
 * Uso encadenado:
 *   $v = new Validate($_POST);
 *   $v->required('titulo', 'Título')
 *     ->maxLength('titulo', 200, 'Título')
 *     ->date('fecha', 'Fecha');
 *
 *   if ($v->fails()) { ... $v->errors() ... }
 *
 * Uso con abort automático (envía 422 y sale):
 *   $v->required('titulo')->maxLength('titulo', 200)->abortIfFails();
 */

class Validate
{
    private array $errors = [];
    private array $data   = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    // ──────────────────────────────────────────────
    // Estado
    // ──────────────────────────────────────────────

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    // ──────────────────────────────────────────────
    // Reglas
    // ──────────────────────────────────────────────

    /** Campo obligatorio */
    public function required(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '' || (is_string($value) && trim($value) === '')) {
            $this->errors[] = "El campo '{$label}' es requerido";
        }
        return $this;
    }

    /** Longitud máxima de cadena */
    public function maxLength(string $field, int $max, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? '';

        if ($value !== '' && mb_strlen((string)$value, 'UTF-8') > $max) {
            $this->errors[] = "El campo '{$label}' no puede superar {$max} caracteres";
        }
        return $this;
    }

    /** Longitud mínima de cadena */
    public function minLength(string $field, int $min, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? '';

        if ($value !== '' && mb_strlen((string)$value, 'UTF-8') < $min) {
            $this->errors[] = "El campo '{$label}' debe tener al menos {$min} caracteres";
        }
        return $this;
    }

    /** Formato de email válido */
    public function email(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? '';

        if ($value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = "El campo '{$label}' debe ser un email válido";
        }
        return $this;
    }

    /** Número entero */
    public function integer(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_INT) === false) {
            $this->errors[] = "El campo '{$label}' debe ser un número entero";
        }
        return $this;
    }

    /** Número entero dentro de un rango */
    public function range(string $field, int $min, int $max, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '') {
            $int = filter_var($value, FILTER_VALIDATE_INT);
            if ($int === false || $int < $min || $int > $max) {
                $this->errors[] = "El campo '{$label}' debe ser un número entre {$min} y {$max}";
            }
        }
        return $this;
    }

    /** Fecha en formato YYYY-MM-DD */
    public function date(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? '';

        if ($value !== '') {
            $d = DateTime::createFromFormat('Y-m-d', $value);
            if (!$d || $d->format('Y-m-d') !== $value) {
                $this->errors[] = "El campo '{$label}' debe tener formato de fecha válido (YYYY-MM-DD)";
            }
        }
        return $this;
    }

    /** Valor dentro de una lista de opciones permitidas */
    public function in(string $field, array $allowed, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !in_array($value, $allowed, true)) {
            $allowed_str    = implode(', ', $allowed);
            $this->errors[] = "El valor de '{$label}' no es válido. Opciones: {$allowed_str}";
        }
        return $this;
    }

    /** URL válida (http o https) */
    public function url(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? '';

        if ($value !== '') {
            $parsed = parse_url($value);
            if (!filter_var($value, FILTER_VALIDATE_URL) || !in_array($parsed['scheme'] ?? '', ['http', 'https'])) {
                $this->errors[] = "El campo '{$label}' debe ser una URL válida (http/https)";
            }
        }
        return $this;
    }

    /** Valor booleano (true/false, 1/0, 'true'/'false', '1'/'0') */
    public function boolean(string $field, string $label = ''): self
    {
        $label  = $label ?: $field;
        $value  = $this->data[$field] ?? null;
        $valids = [true, false, 1, 0, '1', '0', 'true', 'false'];

        if ($value !== null && $value !== '' && !in_array($value, $valids, true)) {
            $this->errors[] = "El campo '{$label}' debe ser un valor booleano";
        }
        return $this;
    }

    // ──────────────────────────────────────────────
    // Respuesta automática
    // ──────────────────────────────────────────────

    /**
     * Si hay errores: envía 422 con JSON y hace exit().
     * Si no hay errores: no hace nada.
     */
    public function abortIfFails(): void
    {
        if ($this->fails()) {
            http_response_code(422);
            echo json_encode([
                'success' => false,
                'error'   => 'Datos inválidos',
                'errors'  => $this->errors,
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }
}
