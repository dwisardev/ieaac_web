-- ============================================================
-- Migración 002: pedidos_libros y mensajes_contacto
-- Ejecutar en phpMyAdmin o herramienta de base de datos
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Crear tabla pedidos_libros (si no existe)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pedidos_libros` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `codigo`     VARCHAR(20)  UNIQUE,
  `nombre`     VARCHAR(200) NOT NULL,
  `email`      VARCHAR(200) NOT NULL,
  `libro`      VARCHAR(500) NOT NULL,
  `detalles`   TEXT,
  `estado`     ENUM('pendiente','leido','respondido') DEFAULT 'pendiente',
  `respuesta`  TEXT,
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `user_agent` TEXT,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Si la tabla ya existe, ajustar columnas:
ALTER TABLE `pedidos_libros`
  MODIFY COLUMN `estado` ENUM('pendiente','leido','respondido') DEFAULT 'pendiente';

ALTER TABLE `pedidos_libros`
  ADD COLUMN IF NOT EXISTS `codigo`    VARCHAR(20) UNIQUE AFTER `id`;

ALTER TABLE `pedidos_libros`
  ADD COLUMN IF NOT EXISTS `respuesta` TEXT AFTER `estado`;

-- ────────────────────────────────────────────────────────────
-- 2. Crear tabla mensajes_contacto (si no existe)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `mensajes_contacto` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `nombre`     VARCHAR(200) NOT NULL,
  `email`      VARCHAR(200) NOT NULL,
  `rol`        VARCHAR(100),
  `mensaje`    TEXT NOT NULL,
  `estado`     ENUM('pendiente','leido','respondido') DEFAULT 'pendiente',
  `respuesta`  TEXT,
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `user_agent` TEXT,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Si la tabla ya existe, ajustar enum y agregar respuesta:
ALTER TABLE `mensajes_contacto`
  MODIFY COLUMN `estado` ENUM('pendiente','leido','respondido') DEFAULT 'pendiente';

ALTER TABLE `mensajes_contacto`
  MODIFY COLUMN `rol` VARCHAR(100) DEFAULT NULL;

ALTER TABLE `mensajes_contacto`
  ADD COLUMN IF NOT EXISTS `respuesta` TEXT AFTER `estado`;
