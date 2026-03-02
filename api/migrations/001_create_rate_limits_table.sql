-- Migración: Crear tabla rate_limits para rate limiting basado en BD
-- Fecha: 2026-02-23
-- Descripción: Migrar de session-based rate limiting a database-based para mejor compatibilidad

CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `identifier_hash` CHAR(32) NOT NULL UNIQUE COMMENT 'MD5 hash del identificador (email, IP, etc)',
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Número de intentos en la ventana actual',
  `first_attempt` INT UNSIGNED NOT NULL COMMENT 'Timestamp del primer intento',
  `blocked_until` INT UNSIGNED NULL COMMENT 'Timestamp hasta el cual está bloqueado (NULL = no bloqueado)',
  `created_at` TIMESTAMP Default CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_identifier_hash` (`identifier_hash`),
  KEY `idx_blocked_until` (`blocked_until`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla para rate limiting basada en BD. Migrado de sessions para compatibilidad con cPanel.';

-- Configurar índice para limpiar registros antiguos
CREATE EVENT IF NOT EXISTS `cleanup_expired_rate_limits`
ON SCHEDULE EVERY 1 HOUR
DO
  DELETE FROM `rate_limits`
  WHERE `updated_at` < DATE_SUB(NOW(), INTERVAL 24 HOUR);
