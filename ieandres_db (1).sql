-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 23-02-2026 a las 21:33:52
-- Versión del servidor: 8.0.45
-- Versión de PHP: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ieandres_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaturas`
--

CREATE TABLE `asignaturas` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `area_curricular` varchar(100) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#6B7280',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `asignaturas`
--

INSERT INTO `asignaturas` (`id`, `nombre`, `codigo`, `area_curricular`, `color`, `activo`, `created_at`) VALUES
(1, 'Matemática', 'MAT', 'Matemática', '#3B82F6', 1, '2026-01-24 16:10:54'),
(2, 'Comunicación', 'COM', 'Comunicación', '#EF4444', 1, '2026-01-24 16:10:54'),
(3, 'Ciencia y Tecnología', 'CYT', 'Ciencia y Tecnología', '#10B981', 1, '2026-01-24 16:10:54'),
(4, 'Ciencias Sociales', 'CCSS', 'Ciencias Sociales', '#F59E0B', 1, '2026-01-24 16:10:54'),
(5, 'Desarrollo Personal', 'DPCC', 'Desarrollo Personal', '#8B5CF6', 1, '2026-01-24 16:10:54'),
(6, 'Educación Física', 'EF', 'Educación Física', '#EC4899', 1, '2026-01-24 16:10:54'),
(7, 'Arte y Cultura', 'ART', 'Arte y Cultura', '#F97316', 1, '2026-01-24 16:10:54'),
(8, 'Educación Religiosa', 'ER', 'Educación Religiosa', '#14B8A6', 1, '2026-01-24 16:10:54'),
(9, 'Inglés', 'ING', 'Inglés', '#6366F1', 1, '2026-01-24 16:10:54'),
(10, 'EPT', 'EPT', 'Educación para el Trabajo', '#84CC16', 1, '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `banners`
--

CREATE TABLE `banners` (
  `id` int NOT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `subtitulo` varchar(200) DEFAULT NULL,
  `imagen` varchar(255) NOT NULL,
  `enlace` varchar(255) DEFAULT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca_categorias`
--

CREATE TABLE `biblioteca_categorias` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `descripcion` text,
  `icono` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#007bff',
  `orden` int DEFAULT '1',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `biblioteca_categorias`
--

INSERT INTO `biblioteca_categorias` (`id`, `nombre`, `slug`, `descripcion`, `icono`, `color`, `orden`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Matemáticas', 'matematicas', 'Libros de álgebra, cálculo, geometría y más', 'calculator', '#3B82F6', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, 'Ciencias Naturales', 'ciencias-naturales', 'Biología, química, física y ciencias de la tierra', 'flask', '#10B981', 2, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, 'Comunicación', 'comunicacion', 'Lenguaje, literatura y redacción', 'book', '#EF4444', 3, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(4, 'Ciencias Sociales', 'ciencias-sociales', 'Historia, geografía, economía y ciudadanía', 'globe', '#F59E0B', 4, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(5, '5to. Secundaria', '5to-secundaria', 'Material de preparación para 5to de secundaria', 'graduation-cap', '#8B5CF6', 5, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca_etiquetas`
--

CREATE TABLE `biblioteca_etiquetas` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca_libros`
--

CREATE TABLE `biblioteca_libros` (
  `id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(200) DEFAULT NULL,
  `editorial` varchar(200) DEFAULT NULL,
  `anio_publicacion` year DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `paginas` int DEFAULT NULL,
  `idioma` varchar(50) DEFAULT 'Español',
  `archivo` varchar(500) NOT NULL,
  `miniatura` varchar(500) DEFAULT NULL,
  `descripcion` text,
  `tamanio_archivo` bigint DEFAULT NULL COMMENT 'Tamaño en bytes',
  `descargas` int DEFAULT '0',
  `vistas` int DEFAULT '0',
  `destacado` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca_libro_etiquetas`
--

CREATE TABLE `biblioteca_libro_etiquetas` (
  `libro_id` int NOT NULL,
  `etiqueta_id` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_miembros`
--

CREATE TABLE `categorias_miembros` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `descripcion` text,
  `orden` int DEFAULT '1',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunicados`
--

CREATE TABLE `comunicados` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `contenido` text NOT NULL,
  `archivo_pdf` varchar(500) DEFAULT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `fecha_publicacion` date NOT NULL,
  `tipo` enum('Académico','Administrativo','General') DEFAULT 'General',
  `destacado` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `comunicados`
--

INSERT INTO `comunicados` (`id`, `titulo`, `contenido`, `archivo_pdf`, `imagen`, `fecha_publicacion`, `tipo`, `destacado`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Matrícula 2025 - Proceso Regular', 'Informamos que el proceso de matrícula para el año escolar 2025 se realizará del 15 al 28 de febrero. Requisitos: DNI del estudiante, partida de nacimiento, certificado de estudios del año anterior y tres fotografías tamaño carnet. Atención de lunes a viernes de 8:00 AM a 3:00 PM.', NULL, NULL, '2025-01-15', 'Administrativo', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, 'Reunión de Padres de Familia', 'Se convoca a todos los padres de familia a la reunión informativa que se realizará el 25 de febrero a las 3:00 PM en el auditorio. Temas: inicio de clases, normas de convivencia y calendario escolar 2025.', NULL, NULL, '2025-01-18', 'General', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, 'Simulacro de Sismo - 15 de Febrero', 'Como parte del plan de gestión de riesgos, se realizará un simulacro de sismo el día 15 de febrero a las 10:00 AM. Solicitamos la participación activa de toda la comunidad educativa.', NULL, NULL, '2025-02-01', 'General', 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cronograma_actividades`
--

CREATE TABLE `cronograma_actividades` (
  `id` int NOT NULL,
  `mes` varchar(50) NOT NULL,
  `orden_mes` int NOT NULL,
  `titulo` text NOT NULL,
  `responsables` text NOT NULL,
  `estado` enum('pendiente','en_progreso','completado','cancelado') DEFAULT 'pendiente',
  `progreso` int DEFAULT '0' COMMENT 'Porcentaje 0-100',
  `conteo` varchar(20) DEFAULT NULL,
  `evidencia` tinyint(1) DEFAULT '0',
  `url_evidencia` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dimensiones_monitoreo`
--

CREATE TABLE `dimensiones_monitoreo` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `color` varchar(20) NOT NULL,
  `icono` varchar(50) NOT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `directorio`
--

CREATE TABLE `directorio` (
  `id` int NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `cargo` enum('Director','Subdirector','Docente','Auxiliar Ed.','Administrativo') DEFAULT 'Docente',
  `fecha_nacimiento` date DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int NOT NULL,
  `nombre_completo` varchar(255) NOT NULL,
  `nombre_corto` varchar(100) NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`id`, `nombre_completo`, `nombre_corto`, `especialidad`, `email`, `telefono`, `foto`, `fecha_ingreso`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Gerardo Florez Condori', 'Prof. Gerardo', 'Matemática', 'gfc.jma@gmail.com', '950891414', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, 'Celia Santa Cruz Palomino', 'Prof. Celia', 'Ciencias Sociales', 'celitakimbiri8@gmail.com', '951802876', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, 'Rosa Cuchillo Huaraya', 'Prof. Rosa', 'Comunicación', 'rosacuchillo29@gmail.com', '953606761', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(4, 'Fredy Arpi Huarcaya', 'Prof. Fredy', 'Educación Física', 'arpihuarcaya85@gmail.com', '979407518', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(5, 'Edgar Antonio Flores Orosco', 'Prof. Edgar', 'Ciencia y Tecnología', 'floresoroscoedgar@gmail.com', '910833656', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(6, 'Juan Carlos Campos Romero', 'Prof. Juan Carlos', 'Educación Religiosa', 'jcyo1997@gmail.com', '960376145', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(7, 'Rudy Santa Cruz Ovalle', 'Prof. Rudy', 'Matemática', 'rudysantacruz1973@gmail.com', '985399558', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(8, 'Naida Quispe Loayza', 'Prof. Naida', 'Arte y Cultura', 'naidaquispeloayza250683@gmail.com', '974203144', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(9, 'Margarita Victoria Saravia Canelo', 'Aux. Margarita', 'Auxiliar de Educación', 'marsc2312j@gmail.com', '933372920', NULL, NULL, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_gestion`
--

CREATE TABLE `documentos_gestion` (
  `id` int NOT NULL,
  `codigo` varchar(20) NOT NULL COMMENT 'pei, pat, pci, ri',
  `nombre` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `archivo` varchar(500) NOT NULL,
  `color` varchar(20) DEFAULT '#4361ee',
  `icono` varchar(50) DEFAULT 'FileText',
  `anio_vigencia` year NOT NULL,
  `orden` int DEFAULT '0',
  `descargas` int DEFAULT '0',
  `vistas` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `documentos_gestion`
--

INSERT INTO `documentos_gestion` (`id`, `codigo`, `nombre`, `descripcion`, `archivo`, `color`, `icono`, `anio_vigencia`, `orden`, `descargas`, `vistas`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'pei', 'Proyecto Educativo Institucional', 'Documento que orienta la gestión escolar a mediano y largo plazo', '/docs/pei_2025.pdf', '#4361ee', 'FileText', '2025', 1, 0, 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, 'pat', 'Plan Anual de Trabajo', 'Planificación operativa anual de la institución educativa', '/docs/pat_2025.pdf', '#7209b7', 'Calendar', '2025', 2, 0, 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, 'pci', 'Proyecto Curricular Institucional', 'Propuesta curricular adaptada al contexto local', '/docs/pci_2025.pdf', '#3f975f', 'Book', '2025', 3, 0, 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(4, 'ri', 'Reglamento Interno', 'Normas de convivencia y organización institucional', '/docs/ri_2025.pdf', '#f72585', 'Shield', '2025', 4, 0, 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estrategias_proyecto`
--

CREATE TABLE `estrategias_proyecto` (
  `id` int NOT NULL,
  `fase` varchar(100) NOT NULL,
  `icono` varchar(50) NOT NULL,
  `color` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `beneficios` text COMMENT 'JSON array',
  `impacto_aprendizaje` int DEFAULT '0',
  `impacto_docencia` int DEFAULT '0',
  `impacto_gestion` int DEFAULT '0',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text,
  `fecha_evento` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `fecha_evento`, `hora_inicio`, `hora_fin`, `imagen`, `ubicacion`, `activo`, `created_at`) VALUES
(1, 'Día del Logro - Primer Semestre', 'Presentación de proyectos y trabajos realizados por los estudiantes durante el primer semestre académico.', '2025-07-28', '09:00:00', '13:00:00', NULL, 'Patio principal de la I.E.', 1, '2026-01-24 16:10:54'),
(2, 'Aniversario Institucional', 'Celebración del aniversario de la I.E. Andrés Avelino Cáceres con actividades culturales y deportivas.', '2025-06-15', '08:00:00', '17:00:00', NULL, 'Instalaciones de la I.E.', 1, '2026-01-24 16:10:54'),
(3, 'Feria de Ciencias 2025', 'Exposición de proyectos científicos elaborados por los estudiantes de todos los grados.', '2025-09-20', '10:00:00', '15:00:00', NULL, 'Aulas y laboratorios', 1, '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grados`
--

CREATE TABLE `grados` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL COMMENT 'Ej: 1°, 2°, 3°, 4°, 5°',
  `nivel` varchar(50) DEFAULT 'Secundaria',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `grados`
--

INSERT INTO `grados` (`id`, `nombre`, `nivel`, `orden`, `activo`, `created_at`, `updated_at`) VALUES
(1, '1°', 'Secundaria', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, '2°', 'Secundaria', 2, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, '3°', 'Secundaria', 3, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(4, '4°', 'Secundaria', 4, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(5, '5°', 'Secundaria', 5, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_bloques`
--

CREATE TABLE `horarios_bloques` (
  `id` int NOT NULL,
  `hora` varchar(20) NOT NULL COMMENT 'Ej: 07:45 - 08:30',
  `es_receso` tinyint(1) DEFAULT '0',
  `orden` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_docentes`
--

CREATE TABLE `horarios_docentes` (
  `id` int NOT NULL,
  `docente_id` int NOT NULL,
  `bloque_id` int NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `asignatura_id` int DEFAULT NULL,
  `grado_id` int DEFAULT NULL,
  `es_receso` tinyint(1) DEFAULT '0',
  `anio_vigencia` year NOT NULL,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_estudiantes`
--

CREATE TABLE `horarios_estudiantes` (
  `id` int NOT NULL,
  `grado_id` int NOT NULL,
  `bloque_id` int NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `asignatura_id` int DEFAULT NULL,
  `docente_id` int DEFAULT NULL,
  `es_receso` tinyint(1) DEFAULT '0',
  `anio_vigencia` year NOT NULL,
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores_monitoreo`
--

CREATE TABLE `indicadores_monitoreo` (
  `id` int NOT NULL,
  `dimension_id` int NOT NULL,
  `competencia` text NOT NULL,
  `meta` int DEFAULT '0',
  `actual` int DEFAULT '0',
  `evidencias` text COMMENT 'JSON array',
  `momentos` text COMMENT 'JSON array de meses',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informacion_institucional`
--

CREATE TABLE `informacion_institucional` (
  `id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `codigo_modular` varchar(20) NOT NULL,
  `director` varchar(255) NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `anio_vigencia` year NOT NULL,
  `grados_atendidos` varchar(100) DEFAULT '1° a 5° de secundaria',
  `nivel_educativo` varchar(50) DEFAULT 'Secundaria',
  `tipo_gestion` varchar(50) DEFAULT 'Pública',
  `activo` tinyint(1) DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `informacion_institucional`
--

INSERT INTO `informacion_institucional` (`id`, `nombre`, `codigo_modular`, `director`, `ubicacion`, `telefono`, `email`, `anio_vigencia`, `grados_atendidos`, `nivel_educativo`, `tipo_gestion`, `activo`, `updated_at`) VALUES
(1, 'I.E. Andrés Avelino Cáceres', '1372374', 'Gerardo Florez Condori', 'Sirenachayocc - La Mar - Ayacucho', '950891414', 'contacto@iecaceres.edu.pe', '2025', '1° a 5° de secundaria', 'Secundaria', 'Pública', 1, '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe_fases`
--

CREATE TABLE `informe_fases` (
  `id` int NOT NULL,
  `fase` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `completado` tinyint(1) DEFAULT '0',
  `orden` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe_logros`
--

CREATE TABLE `informe_logros` (
  `id` int NOT NULL,
  `participacion_estudiantil` decimal(5,2) DEFAULT '0.00',
  `docentes_capacitados` decimal(5,2) DEFAULT '0.00',
  `productos_generados` int DEFAULT '0',
  `familias_involucradas` decimal(5,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe_resultados`
--

CREATE TABLE `informe_resultados` (
  `id` int NOT NULL,
  `tipo` enum('Aprendizaje','Desempeño Docente','Gestión Escolar') NOT NULL,
  `competencia` varchar(255) NOT NULL,
  `meta_destacado` decimal(5,2) DEFAULT NULL,
  `meta_proceso` decimal(5,2) DEFAULT NULL,
  `meta_inicio` decimal(5,2) DEFAULT NULL,
  `inicio_destacado` decimal(5,2) DEFAULT NULL,
  `inicio_proceso` decimal(5,2) DEFAULT NULL,
  `inicio_inicio` decimal(5,2) DEFAULT NULL,
  `actual_destacado` decimal(5,2) DEFAULT NULL,
  `actual_proceso` decimal(5,2) DEFAULT NULL,
  `actual_inicio` decimal(5,2) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#4361ee',
  `evidencias` text COMMENT 'JSON array',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `user_agent` text,
  `success` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `ip`, `user_agent`, `success`, `created_at`) VALUES
(1, 'admin', '158.69.18.249', 'Unknown', 0, '2026-02-16 19:02:29'),
(2, 'admin', '132.157.128.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, '2026-02-16 19:03:19'),
(3, 'admin', '158.69.18.249', 'Unknown', 0, '2026-02-16 19:04:13'),
(4, 'admin', '132.157.128.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, '2026-02-16 19:07:12'),
(5, 'admin', '132.157.128.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, '2026-02-16 19:17:44'),
(6, 'admin', '132.157.128.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-16 19:18:57'),
(7, 'admin', '190.239.77.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-17 08:43:11'),
(8, 'admin', '190.239.77.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, '2026-02-17 08:49:26'),
(9, 'admin', '190.239.77.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-17 08:49:36'),
(10, 'admin', '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-18 15:38:55'),
(11, 'admin', '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-18 15:52:58'),
(12, 'admin', '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-18 16:10:44'),
(13, 'admin', '190.239.76.168', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-21 07:57:14'),
(14, 'admin', '190.239.76.168', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 0, '2026-02-21 08:58:27'),
(15, 'admin', '190.239.76.168', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-21 08:58:39'),
(16, 'admin', '132.184.129.87', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-21 10:48:11'),
(17, 'admin', '132.157.130.196', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, '2026-02-22 14:50:58'),
(18, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 0, '2026-02-22 15:56:38'),
(19, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 0, '2026-02-22 15:56:47'),
(20, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 15:56:56'),
(21, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 0, '2026-02-22 15:59:16'),
(22, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 15:59:23'),
(23, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 0, '2026-02-22 17:00:32'),
(24, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 17:00:37'),
(25, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 18:18:43'),
(26, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 20:29:48'),
(27, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 20:40:40'),
(28, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 21:49:01'),
(29, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:07:57'),
(30, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:08:09'),
(31, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:18:10'),
(32, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:18:30'),
(33, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:19:14'),
(34, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:19:30'),
(35, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:19:44'),
(36, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:42:40'),
(37, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:46:30'),
(38, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:47:37'),
(39, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:52:00'),
(40, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 22:57:43'),
(41, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 23:01:51'),
(42, 'admin', '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 1, '2026-02-22 23:10:29'),
(43, 'admin', '77.111.246.55', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/95.0.0.0', 1, '2026-02-23 10:26:09'),
(44, 'admin', '77.111.246.55', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/95.0.0.0', 1, '2026-02-23 10:26:27'),
(45, 'admin', '77.111.246.55', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/129.0.0.0', 1, '2026-02-23 10:27:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `login_history`
--

CREATE TABLE `login_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ip` varchar(45) NOT NULL,
  `user_agent` text,
  `location` varchar(100) DEFAULT NULL,
  `success` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `ip`, `user_agent`, `location`, `success`, `created_at`) VALUES
(1, 1, '132.157.128.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-16 19:18:57'),
(2, 1, '190.239.77.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-17 08:43:11'),
(3, 1, '190.239.77.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-17 08:49:36'),
(4, 1, '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-18 15:38:55'),
(5, 1, '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-18 15:52:58'),
(6, 1, '132.157.128.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-18 16:10:44'),
(7, 1, '190.239.76.168', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-21 07:57:14'),
(8, 1, '190.239.76.168', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-21 08:58:39'),
(9, 1, '132.184.129.87', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-21 10:48:11'),
(10, 1, '132.157.130.196', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 14:50:58'),
(11, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 15:56:56'),
(12, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 15:59:23'),
(13, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 17:00:37'),
(14, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 18:18:43'),
(15, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 20:29:48'),
(16, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 20:40:40'),
(17, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 21:49:01'),
(18, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:07:57'),
(19, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:08:09'),
(20, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:18:10'),
(21, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:18:30'),
(22, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:19:14'),
(23, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:19:30'),
(24, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:19:44'),
(25, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:42:40'),
(26, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:46:30'),
(27, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:47:37'),
(28, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:52:00'),
(29, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 22:57:43'),
(30, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 23:01:51'),
(31, 1, '132.157.130.196', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 1, '2026-02-22 23:10:29'),
(32, 1, '77.111.246.55', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/95.0.0.0', NULL, 1, '2026-02-23 10:26:09'),
(33, 1, '77.111.246.55', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/95.0.0.0', NULL, 1, '2026-02-23 10:26:27'),
(34, 1, '77.111.246.55', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 OPR/129.0.0.0', NULL, 1, '2026-02-23 10:27:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logros`
--

CREATE TABLE `logros` (
  `id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `categoria` enum('Académico','Deportivo','Cultural','Institucional','Otro') DEFAULT 'Académico',
  `fecha_logro` date NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `destacado` tinyint(1) DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `orden` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `email` varchar(150) NOT NULL,
  `rol` enum('estudiante','docente','padre/madre','comunidad','otro') NOT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('pendiente','leido','respondido','archivado') DEFAULT 'pendiente',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `miembros`
--

CREATE TABLE `miembros` (
  `id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `cargo` varchar(200) DEFAULT NULL,
  `especialidad` varchar(150) DEFAULT NULL,
  `condicion` varchar(100) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `rol` varchar(150) DEFAULT NULL,
  `orden` int DEFAULT '1',
  `anio_escolar` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticias`
--

CREATE TABLE `noticias` (
  `id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text,
  `contenido` text NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `autor_id` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `destacada` tinyint(1) DEFAULT '0',
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `noticias`
--

INSERT INTO `noticias` (`id`, `titulo`, `descripcion`, `contenido`, `imagen`, `categoria`, `autor`, `autor_id`, `fecha`, `destacada`, `activa`, `created_at`, `updated_at`) VALUES
(1, 'Inicio del Año Escolar 2025', 'Bienvenida oficial al año académico 2025 en la I.E. Andrés Avelino Cáceres', 'Con gran entusiasmo damos la bienvenida a todos los estudiantes, padres de familia y docentes al año escolar 2025. Este año viene cargado de nuevos retos y oportunidades de aprendizaje. Los esperamos el 11 de marzo para iniciar juntos esta nueva aventura educativa.', NULL, 'Institucional', 'Dirección', NULL, '2025-01-20', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(2, 'Juramentación de Brigadieres 2025', 'Ceremonia de juramentación de los nuevos brigadieres escolares', 'En una emotiva ceremonia, los estudiantes seleccionados juraron como brigadieres escolares para el año 2025. Estos jóvenes líderes serán el ejemplo de responsabilidad y compromiso en sus respectivas aulas.', NULL, 'Académico', 'Prof. Gerardo', NULL, '2025-01-15', 1, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(3, 'Campeonato Deportivo Interescolar', 'Nuestros estudiantes destacan en competencias deportivas', 'El equipo de la institución obtuvo destacados resultados en el campeonato deportivo interescolar, demostrando talento y disciplina en diversas disciplinas como fútbol, vóleibol y atletismo.', NULL, 'Deportes', 'Prof. Fredy', NULL, '2025-01-10', 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54'),
(4, 'Taller de Reforzamiento en Matemática', 'Inician talleres de refuerzo académico para estudiantes', 'Con el objetivo de fortalecer las competencias matemáticas, se han iniciado talleres de reforzamiento los días sábados. Los estudiantes podrán resolver dudas y practicar ejercicios de forma personalizada.', NULL, 'Académico', 'Prof. Gerardo', NULL, '2025-01-08', 0, 1, '2026-01-24 16:10:54', '2026-01-24 16:10:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos_libros`
--

CREATE TABLE `pedidos_libros` (
  `id` int NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `email` varchar(150) NOT NULL,
  `libro` varchar(250) NOT NULL,
  `detalles` text,
  `estado` enum('pendiente','en_proceso','entregado','cancelado') DEFAULT 'pendiente',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_lector_actividades`
--

CREATE TABLE `plan_lector_actividades` (
  `id` int NOT NULL,
  `cronograma_id` int NOT NULL,
  `actividad` text NOT NULL,
  `orden` int DEFAULT '1',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_lector_config`
--

CREATE TABLE `plan_lector_config` (
  `id` int NOT NULL,
  `anio_escolar` int NOT NULL,
  `director` varchar(200) DEFAULT NULL,
  `codigo_modular` varchar(50) DEFAULT NULL,
  `lema` varchar(250) DEFAULT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_lector_cronograma`
--

CREATE TABLE `plan_lector_cronograma` (
  `id` int NOT NULL,
  `mes` varchar(50) NOT NULL,
  `orden_mes` int NOT NULL,
  `responsable` varchar(200) NOT NULL,
  `anio_escolar` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_lector_libros`
--

CREATE TABLE `plan_lector_libros` (
  `id` int NOT NULL,
  `grado_id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `autor` varchar(200) NOT NULL,
  `archivo_url` varchar(500) DEFAULT NULL,
  `orden` int DEFAULT '1',
  `anio_escolar` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan_lector_metas`
--

CREATE TABLE `plan_lector_metas` (
  `id` int NOT NULL,
  `meta` text NOT NULL,
  `orden` int DEFAULT '1',
  `anio_escolar` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `portafolio_actividades`
--

CREATE TABLE `portafolio_actividades` (
  `id` int NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `categoria` enum('intercultural','pedagogico','comunitario','evaluacion','otro') DEFAULT 'otro',
  `rubro` enum('Diagnóstico y Reflexión','Planificación y Organización','Ejecución de la Experiencia','Evaluación y Sistematización') NOT NULL,
  `fecha_realizacion` date DEFAULT NULL,
  `responsables` varchar(255) DEFAULT NULL,
  `participantes` text COMMENT 'JSON array',
  `imagen_principal` varchar(255) DEFAULT NULL,
  `galeria_imagenes` text COMMENT 'JSON array',
  `archivos_adjuntos` text COMMENT 'JSON array',
  `resultados` text,
  `lecciones_aprendidas` text,
  `destacado` tinyint(1) DEFAULT '0',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto_fondep_metadata`
--

CREATE TABLE `proyecto_fondep_metadata` (
  `id` int NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `tipo` enum('texto','numero','fecha','json','archivo') DEFAULT 'texto',
  `descripcion` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rate_limits`
--

CREATE TABLE `rate_limits` (
  `id` int UNSIGNED NOT NULL,
  `identifier_hash` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int UNSIGNED NOT NULL DEFAULT '0',
  `first_attempt` int UNSIGNED NOT NULL,
  `blocked_until` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`) VALUES
(1, 1, '16c08bacb9b79ccbdc431ed78402139b5eeb1a839bf476f2a6f1e19dd08bc122', '2026-02-23 19:18:57', '2026-02-16 19:18:57'),
(3, 1, 'dae64ddd8ff72e0c4359fcdf14bc1827cdedbb8ddbe7afb82160a5c8ae74215e', '2026-02-24 08:43:22', '2026-02-17 08:43:22'),
(5, 1, 'aa360288c6f324c83727488ba4da9f65556b028e16690f3e4b524571d9189736', '2026-02-24 08:49:47', '2026-02-17 08:49:47'),
(7, 1, '8ed82e897fa23693b8b1c20cc6877409e51722aee624e37023909c86471fe934', '2026-02-25 15:39:15', '2026-02-18 15:39:15'),
(9, 1, 'e963c244486b96e32464b78d9a006d36516d7dc0c833339c46218de55770da07', '2026-02-25 16:10:32', '2026-02-18 16:10:32'),
(10, 1, '82079c58f0d2a616cc8a3e3497dc45d5faa48faefed9bc93e2c12bb749150334', '2026-02-25 16:10:44', '2026-02-18 16:10:44'),
(12, 1, 'de2e7cef269a867223b308c0e5e2cbea5c79726b1006fcad9b7083246f6c460a', '2026-02-28 07:57:50', '2026-02-21 07:57:50'),
(15, 1, '1a6a017f427c8afb1458d0e3b3fef19ed2607700c71a879b919cb93acbbf1570', '2026-02-28 10:44:38', '2026-02-21 10:44:38'),
(17, 1, '19d0c1f93c9fec6546e1ecb9ade052144c6c8bdd573d93deed621783132b214c', '2026-02-28 10:57:18', '2026-02-21 10:57:18'),
(19, 1, 'a244a9a6d9657f4e0efdb0db7703a94a74857a867ef6b24cb762b258b82ba2e8', '2026-03-01 14:51:42', '2026-02-22 14:51:42'),
(20, 1, '4c45ec2c3132d107e577a80219bb61175028d625be0f5c7c62af7b88dd2d0405', '2026-03-01 15:56:56', '2026-02-22 15:56:56'),
(22, 1, '5ffbfaa63ef5399d748dee2ad33415a0ef82fedf17df8a9e7295b097747c46a9', '2026-03-01 15:59:37', '2026-02-22 15:59:37'),
(24, 1, 'e651505e60f4de2f8340f4b19e2f4f17708f156ab9d64a0ea8180dc9fa6f320a', '2026-03-01 17:15:47', '2026-02-22 17:15:47'),
(25, 1, '0e289787357ccb90dc4d9c109548c6d3a5bd06959b87b8340c4563cd626a3ea2', '2026-03-01 18:18:43', '2026-02-22 18:18:43'),
(27, 1, '66a9f657a588d9f31fdae2fae5509516822f67d17be5d04788cf0de211343b10', '2026-03-01 20:29:49', '2026-02-22 20:29:49'),
(29, 1, '2955d11937e9153740604927e038264a230bb851942e21c490e6b2f3222c1b4b', '2026-03-01 20:40:41', '2026-02-22 20:40:41'),
(34, 1, '713d5feab6acd5d3288c486858319b880428ac59e55aea5fc261bf45010d4db4', '2026-03-01 22:02:13', '2026-02-22 22:02:13'),
(36, 1, 'ffef1bb1685d0967dbbad933f9097a510b2a692008fbc0336c29bbeddff49ef3', '2026-03-01 22:02:19', '2026-02-22 22:02:19'),
(38, 1, 'bd0e326b7b7fce4a3aa3edd1d97a1945d3462c2fd1e793c6a5075f8adb974b6d', '2026-03-01 22:07:58', '2026-02-22 22:07:58'),
(41, 1, 'a49f6aafdf76f8d6a6b5144363cc4a88315c36ef61e1d4b724f9cbefa0cfcf92', '2026-03-01 22:08:11', '2026-02-22 22:08:11'),
(43, 1, '438f4ebb7c5719ca22c7130c8e89ee1285cd513288890b0225239e2dd310738e', '2026-03-01 22:18:11', '2026-02-22 22:18:11'),
(45, 1, '24c70f4af0abc1061fa83f8c5655300b76fc33563968e9e8dfcfd02aec618b3e', '2026-03-01 22:18:31', '2026-02-22 22:18:31'),
(47, 1, 'e2e8b4f69112953bd251beab1beade21ce23ee833cfcd1e47c0e17f03812c66c', '2026-03-01 22:19:15', '2026-02-22 22:19:15'),
(49, 1, 'e1b6a5fb187201afd1f91ed4eb9bf6d7d879a6d18aed2a6abd131bb062d026b7', '2026-03-01 22:19:31', '2026-02-22 22:19:31'),
(51, 1, '15492fda547333b1ea518285658770c5a308e650760a4fec8c660c4182dac5a2', '2026-03-01 22:19:45', '2026-02-22 22:19:45'),
(55, 1, 'e0841bf64b9f7cc5f51a33b7fb4265c163888bb48f8c6caa45813eae3a3cc20b', '2026-03-01 22:42:43', '2026-02-22 22:42:43'),
(57, 1, '9df7ce0fde75f7cd2b3e77f9f1fe5a1109c652ac705396e5c59fd3375597afdd', '2026-03-01 22:46:31', '2026-02-22 22:46:31'),
(59, 1, '8ec1f6fb5dfa4a868379220a1b5969c1e05be5b63d6eb4ebc9d40dcbc5b11cd9', '2026-03-01 22:47:38', '2026-02-22 22:47:38'),
(61, 1, 'ca3a64fa2bb73f9fc35ea04d765ddd1e9b1ee2e7fb4654733e5b465317237686', '2026-03-01 22:52:01', '2026-02-22 22:52:01'),
(63, 1, '8ca97d472ff65f941f593ad813f16e0f98452d61e69f8127e01b83f3d14aad6b', '2026-03-01 22:57:44', '2026-02-22 22:57:44'),
(65, 1, '39882eb861bf2f109213487adfa51e639b084c09d09cafee0981085277e0b0d7', '2026-03-01 23:01:52', '2026-02-22 23:01:52'),
(68, 1, '80436a5ddb5c7045365503e36db2f5fd4eff5ed915553ba4cd2210327e098fde', '2026-03-01 23:10:05', '2026-02-22 23:10:05'),
(70, 1, '2e19ccef81552b9e7770f1878e026aa308219584ce943b85d0f57c11182e451f', '2026-03-01 23:10:30', '2026-02-22 23:10:30'),
(72, 1, '5d0fecda1a4dacd3f4576f788631b8c0689162a4084967717c5e10290c13d473', '2026-03-02 10:26:10', '2026-02-23 10:26:10'),
(74, 1, 'b33169726194368ec862c2423e7f9d1e92b4b05184dc2d23872e07992531dd0b', '2026-03-02 10:26:28', '2026-02-23 10:26:28'),
(76, 1, '9ec7917921452c216adbc8f4c12eeceada7098c93f666fc6b69e4dbed1c46634', '2026-03-02 10:27:12', '2026-02-23 10:27:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `security_logs`
--

CREATE TABLE `security_logs` (
  `id` int NOT NULL,
  `level` varchar(20) NOT NULL,
  `event` varchar(100) NOT NULL,
  `user_id` int DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `data` json DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `token_blacklist`
--

CREATE TABLE `token_blacklist` (
  `id` int NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `user_id` int NOT NULL,
  `revoked_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','editor','docente','usuario') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `email`, `password`, `rol`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@iecaceres.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '2026-02-17 00:16:43', '2026-02-17 00:16:43'),
(2, 'gerardo.florez', 'gfc.jma@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '2026-02-17 00:16:43', '2026-02-17 00:16:43'),
(3, 'editor', 'editor@iecaceres.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'editor', 1, '2026-02-17 00:16:43', '2026-02-17 00:16:43'),
(4, 'docente', 'docente@iecaceres.edu.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docente', 1, '2026-02-17 00:16:43', '2026-02-17 00:16:43');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asignaturas`
--
ALTER TABLE `asignaturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `biblioteca_categorias`
--
ALTER TABLE `biblioteca_categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_orden` (`orden`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `biblioteca_etiquetas`
--
ALTER TABLE `biblioteca_etiquetas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `biblioteca_libros`
--
ALTER TABLE `biblioteca_libros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria_id`),
  ADD KEY `idx_titulo` (`titulo`),
  ADD KEY `idx_destacado` (`destacado`),
  ADD KEY `idx_activo` (`activo`);
ALTER TABLE `biblioteca_libros` ADD FULLTEXT KEY `idx_fulltext_titulo` (`titulo`);

--
-- Indices de la tabla `biblioteca_libro_etiquetas`
--
ALTER TABLE `biblioteca_libro_etiquetas`
  ADD PRIMARY KEY (`libro_id`,`etiqueta_id`),
  ADD KEY `etiqueta_id` (`etiqueta_id`);

--
-- Indices de la tabla `categorias_miembros`
--
ALTER TABLE `categorias_miembros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `comunicados`
--
ALTER TABLE `comunicados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha` (`fecha_publicacion` DESC),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_destacado` (`destacado`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `cronograma_actividades`
--
ALTER TABLE `cronograma_actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mes` (`orden_mes`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `dimensiones_monitoreo`
--
ALTER TABLE `dimensiones_monitoreo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `directorio`
--
ALTER TABLE `directorio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cargo` (`cargo`),
  ADD KEY `idx_orden` (`orden`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre_corto` (`nombre_corto`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `documentos_gestion`
--
ALTER TABLE `documentos_gestion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_anio` (`anio_vigencia`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `estrategias_proyecto`
--
ALTER TABLE `estrategias_proyecto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha_evento` (`fecha_evento`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `grados`
--
ALTER TABLE `grados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_orden` (`orden`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `horarios_bloques`
--
ALTER TABLE `horarios_bloques`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `horarios_docentes`
--
ALTER TABLE `horarios_docentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `horario_docente_unico` (`docente_id`,`bloque_id`,`dia_semana`,`anio_vigencia`),
  ADD KEY `bloque_id` (`bloque_id`),
  ADD KEY `asignatura_id` (`asignatura_id`),
  ADD KEY `grado_id` (`grado_id`),
  ADD KEY `idx_docente_anio` (`docente_id`,`anio_vigencia`);

--
-- Indices de la tabla `horarios_estudiantes`
--
ALTER TABLE `horarios_estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `horario_unico` (`grado_id`,`bloque_id`,`dia_semana`,`anio_vigencia`),
  ADD KEY `bloque_id` (`bloque_id`),
  ADD KEY `asignatura_id` (`asignatura_id`),
  ADD KEY `docente_id` (`docente_id`),
  ADD KEY `idx_grado_anio` (`grado_id`,`anio_vigencia`);

--
-- Indices de la tabla `indicadores_monitoreo`
--
ALTER TABLE `indicadores_monitoreo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dimension` (`dimension_id`);

--
-- Indices de la tabla `informacion_institucional`
--
ALTER TABLE `informacion_institucional`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `informe_fases`
--
ALTER TABLE `informe_fases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `informe_logros`
--
ALTER TABLE `informe_logros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `informe_resultados`
--
ALTER TABLE `informe_resultados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_ip` (`ip`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `logros`
--
ALTER TABLE `logros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_fecha` (`fecha_logro`),
  ADD KEY `idx_destacado` (`destacado`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_email` (`email`);

--
-- Indices de la tabla `miembros`
--
ALTER TABLE `miembros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria_id`),
  ADD KEY `idx_anio` (`anio_escolar`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indices de la tabla `noticias`
--
ALTER TABLE `noticias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `autor_id` (`autor_id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_fecha` (`fecha` DESC),
  ADD KEY `idx_destacada` (`destacada`),
  ADD KEY `idx_activa` (`activa`);

--
-- Indices de la tabla `pedidos_libros`
--
ALTER TABLE `pedidos_libros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `plan_lector_actividades`
--
ALTER TABLE `plan_lector_actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cronograma` (`cronograma_id`);

--
-- Indices de la tabla `plan_lector_config`
--
ALTER TABLE `plan_lector_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `anio_escolar` (`anio_escolar`);

--
-- Indices de la tabla `plan_lector_cronograma`
--
ALTER TABLE `plan_lector_cronograma`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden_mes`),
  ADD KEY `idx_anio` (`anio_escolar`);

--
-- Indices de la tabla `plan_lector_libros`
--
ALTER TABLE `plan_lector_libros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_grado` (`grado_id`),
  ADD KEY `idx_anio` (`anio_escolar`);

--
-- Indices de la tabla `plan_lector_metas`
--
ALTER TABLE `plan_lector_metas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orden` (`orden`),
  ADD KEY `idx_anio` (`anio_escolar`);

--
-- Indices de la tabla `portafolio_actividades`
--
ALTER TABLE `portafolio_actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_rubro` (`rubro`),
  ADD KEY `idx_destacado` (`destacado`);

--
-- Indices de la tabla `proyecto_fondep_metadata`
--
ALTER TABLE `proyecto_fondep_metadata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`);

--
-- Indices de la tabla `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identifier_hash` (`identifier_hash`),
  ADD KEY `idx_identifier_hash` (`identifier_hash`),
  ADD KEY `idx_blocked_until` (`blocked_until`);

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indices de la tabla `security_logs`
--
ALTER TABLE `security_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_level` (`level`),
  ADD KEY `idx_event` (`event`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asignaturas`
--
ALTER TABLE `asignaturas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `biblioteca_categorias`
--
ALTER TABLE `biblioteca_categorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `biblioteca_etiquetas`
--
ALTER TABLE `biblioteca_etiquetas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `biblioteca_libros`
--
ALTER TABLE `biblioteca_libros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_miembros`
--
ALTER TABLE `categorias_miembros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comunicados`
--
ALTER TABLE `comunicados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cronograma_actividades`
--
ALTER TABLE `cronograma_actividades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dimensiones_monitoreo`
--
ALTER TABLE `dimensiones_monitoreo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `directorio`
--
ALTER TABLE `directorio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `documentos_gestion`
--
ALTER TABLE `documentos_gestion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estrategias_proyecto`
--
ALTER TABLE `estrategias_proyecto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `grados`
--
ALTER TABLE `grados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `horarios_bloques`
--
ALTER TABLE `horarios_bloques`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios_docentes`
--
ALTER TABLE `horarios_docentes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios_estudiantes`
--
ALTER TABLE `horarios_estudiantes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores_monitoreo`
--
ALTER TABLE `indicadores_monitoreo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `informacion_institucional`
--
ALTER TABLE `informacion_institucional`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `informe_fases`
--
ALTER TABLE `informe_fases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `informe_logros`
--
ALTER TABLE `informe_logros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `informe_resultados`
--
ALTER TABLE `informe_resultados`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `logros`
--
ALTER TABLE `logros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `miembros`
--
ALTER TABLE `miembros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `noticias`
--
ALTER TABLE `noticias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pedidos_libros`
--
ALTER TABLE `pedidos_libros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_lector_actividades`
--
ALTER TABLE `plan_lector_actividades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_lector_config`
--
ALTER TABLE `plan_lector_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_lector_cronograma`
--
ALTER TABLE `plan_lector_cronograma`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_lector_libros`
--
ALTER TABLE `plan_lector_libros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan_lector_metas`
--
ALTER TABLE `plan_lector_metas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `portafolio_actividades`
--
ALTER TABLE `portafolio_actividades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecto_fondep_metadata`
--
ALTER TABLE `proyecto_fondep_metadata`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rate_limits`
--
ALTER TABLE `rate_limits`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `security_logs`
--
ALTER TABLE `security_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `token_blacklist`
--
ALTER TABLE `token_blacklist`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `biblioteca_libros`
--
ALTER TABLE `biblioteca_libros`
  ADD CONSTRAINT `biblioteca_libros_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `biblioteca_categorias` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `biblioteca_libro_etiquetas`
--
ALTER TABLE `biblioteca_libro_etiquetas`
  ADD CONSTRAINT `biblioteca_libro_etiquetas_ibfk_1` FOREIGN KEY (`libro_id`) REFERENCES `biblioteca_libros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `biblioteca_libro_etiquetas_ibfk_2` FOREIGN KEY (`etiqueta_id`) REFERENCES `biblioteca_etiquetas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios_docentes`
--
ALTER TABLE `horarios_docentes`
  ADD CONSTRAINT `horarios_docentes_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_docentes_ibfk_2` FOREIGN KEY (`bloque_id`) REFERENCES `horarios_bloques` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_docentes_ibfk_3` FOREIGN KEY (`asignatura_id`) REFERENCES `asignaturas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `horarios_docentes_ibfk_4` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `horarios_estudiantes`
--
ALTER TABLE `horarios_estudiantes`
  ADD CONSTRAINT `horarios_estudiantes_ibfk_1` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_estudiantes_ibfk_2` FOREIGN KEY (`bloque_id`) REFERENCES `horarios_bloques` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `horarios_estudiantes_ibfk_3` FOREIGN KEY (`asignatura_id`) REFERENCES `asignaturas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `horarios_estudiantes_ibfk_4` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `indicadores_monitoreo`
--
ALTER TABLE `indicadores_monitoreo`
  ADD CONSTRAINT `indicadores_monitoreo_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `dimensiones_monitoreo` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `miembros`
--
ALTER TABLE `miembros`
  ADD CONSTRAINT `miembros_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_miembros` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `noticias`
--
ALTER TABLE `noticias`
  ADD CONSTRAINT `noticias_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `plan_lector_actividades`
--
ALTER TABLE `plan_lector_actividades`
  ADD CONSTRAINT `plan_lector_actividades_ibfk_1` FOREIGN KEY (`cronograma_id`) REFERENCES `plan_lector_cronograma` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `plan_lector_libros`
--
ALTER TABLE `plan_lector_libros`
  ADD CONSTRAINT `plan_lector_libros_ibfk_1` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`ieandres`@`localhost` EVENT `cleanup_security_data` ON SCHEDULE EVERY 1 DAY STARTS '2026-01-31 16:56:10' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    -- Limpiar intentos > 30 días
    DELETE FROM login_attempts 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Limpiar tokens expirados
    DELETE FROM token_blacklist 
    WHERE expires_at < NOW();
    
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW();
    
    -- Limpiar logs > 90 días
    DELETE FROM security_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
