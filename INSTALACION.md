# 🚀 GUÍA DE INSTALACIÓN - CORRECCIONES DE SEGURIDAD OWASP 2025

## ⚡ Resumen Rápido

Se han implementado todas las correcciones de seguridad. Para que funcione sinproblemas en cPanel:

### 1️⃣ PASO 1: Crear tabla de rate limiting (Ejecutar una sola vez)

**Via phpMyAdmin o terminal MySQL:**

```sql
CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `identifier_hash` CHAR(32) NOT NULL UNIQUE,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `first_attempt` INT UNSIGNED NOT NULL,
  `blocked_until` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_identifier_hash` (`identifier_hash`),
  KEY `idx_blocked_until` (`blocked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**O ejecutar el archivo SQL:**
```bash
mysql -u tu_usuario -p tu_base_datos < api/migrations/001_create_rate_limits_table.sql
```

### 2️⃣ PASO 2: Verificar .env (Debe tener JWT_SECRET configurado)

**Archivo:** `.env` (en raíz)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ieandres_db
DB_USER=ieandres_demosirena
DB_PASS=tu_contraseña_aqui

JWT_SECRET=AQUI_VA_UNA_CLAVE_DE_32_CARACTERES_ALEATORIOS
JWT_ISSUER=ieandresavelinocaceres.com
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900

SECURITY_LOG_ENABLED=true
APP_ENV=production
```

**⚠️ IMPORTANTE:**
- Cambia `DB_PASS` a tu contraseña real
- Genera un JWT_SECRET seguro (32+ caracteres aleatorios)
- No compartas el .env públicamente
- Agrega `.env` a `.gitignore`

### 3️⃣ PASO 3: Verificar permisos de carpetas

```bash
# Directorios que necesitan permisos de escritura:
chmod 755 api/logs/
chmod 755 api/public/uploads/
chmod 755 portal-web/uploads/
```

### 4️⃣ PASO 4: Probar la API

**Verificar que funciona:**

```bash
# Ping a la API (debe retornar JSON)
curl https://tu-dominio.com/api/

# Probar conexión BD (debe retornar datos BD)
curl https://tu-dominio.com/api/test

# Probar login
curl -X POST https://tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_contraseña"}'
```

---

## ✅ QUÉ SE CORRIGIÓ

### Vulnerabilidades CRÍTICAS
- ✅ XSS en useAutoLogout.js
- ✅ Exposición de excepciones (getMessage)
- ✅ JWT_SECRET sin validación

### Vulnerabilidades ALTAS
- ✅ CORS débil (ahora con whitelist exacta)
- ✅ Rate limiting en cPanel (migrado a BD)
- ✅ CSRF tokens faltantes (ahora implementado)

### Vulnerabilidades MEDIAS
- ✅ Headers de seguridad incompletos (CSP, HSTS, etc)
- ✅ Búsquedas LIKE sin límites (ahora con máximo 100 chars)
- ✅ Validación de IP logging inconsistente

### Vulnerabilidades BAJAS
- ✅ Validación de fechas débil (ahora con DateTime)
- ✅ Sin logging de acceso denegado (ahora implementado)
- ✅ XSS en método clean() del backend

---

## 🔧 ARCHIVOS MODIFICADOS

### Frontend
```
admin-panel/src/hooks/useAutoLogout.js       ✅ XSS corregido
admin-panel/src/services/api.js              ✅ CSRF token agregado
admin-panel/src/services/csrf.js             ✨ NUEVO - Servicio CSRF
```

### Backend
```
api/index.php                                 ✅ Headers, CORS, CSRF, logging
api/config/Security.php                      ✅ Rate limit BD, validación
api/config/Database.php                      (sin cambios)
api/middleware/Auth.php                      ✅ Compatible con cPanel
api/middleware/CSRF.php                      ✨ NUEVO - Validación CSRF
api/init_security.php                        ✨ NUEVO - Validación al inicio
api/controllers/NoticiasController.php       ✅ Límites LIKE, fechas
api/controllers/UsersController.php          ✅ Límites LIKE
api/test_database.php                        ✅ Sin exposición de errores
api/migrations/001_*                         ✨ NUEVO - SQL para rate limits
```

---

## 🐛 SI VES ERRORES

### Error 401 (No autenticado)
**Causa:** Token JWT faltante o expirado
**Solución:** Hacer login primero, JWT debe estar en header `Authorization: Bearer TOKEN`

### Error 403 (Acceso denegado)
**Causa:** Usuario no tiene rol admin/editor, o falta CSRF token
**Solución:**
1. Verificar rol del usuario en BD
2. Verificar que CSRF token se está enviando en POST/PUT/DELETE

### Error 500 (Error interno)
**Causa:** Generalmente tabla no existe o JWT_SECRET mal configurado
**Solución:**
1. Revisar `/api/logs/php_errors.log`
2. Crear tabla `rate_limits` (PASO 1)
3. Verificar JWT_SECRET en .env

### Error de CORS
**Causa:** Origin no está en whitelist de CORS
**Solución:** Si es desarrollo local, ya está incluido (localhost:3000, localhost:5173, etc)

---

## 📊 Testing

### Prueba completa de flujo
```bash
# 1. Login
TOKEN=$(curl -s -X POST https://tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"contraseña"}' \
  | jq -r '.data.access_token')

echo "Token: $TOKEN"

# 2. Acceder a ruta protegida (GET - no requiere CSRF)
curl -s https://tu-dominio.com/api/admin/noticias \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# 3. Crear noticia (POST - requiere CSRF)
curl -s -X POST https://tu-dominio.com/api/admin/noticias \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: 1234567890abcdef1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Test","descripcion":"Test"}'
```

---

## 📋 Checklist Post-Instalación

- [ ] Tabla `rate_limits` creada en BD
- [ ] `.env` configurado con JWT_SECRET de 32+ caracteres
- [ ] Directorios logs/ y uploads/ con permisos 755
- [ ] Probé login con usuario admin
- [ ] Probé crear/editar/eliminar noticia
- [ ] Revisé `/api/logs/security.log` para verificar eventos
- [ ] Probé que CORS funciona desde admin-panel
- [ ] Probé rate limiting (5 intentos fallidos = bloqueo 15 min)

---

## 🔐 Notas de Seguridad

1. **JWT_SECRET** - Cámbialo cada 6-12 meses
2. **Rate Limiting** - Bloquea por 15 min tras 5 intentos fallidos
3. **CSRF Tokens** - Se generan automáticamente, válido por sesión
4. **IP Logging** - Registra intentos fallidos con IP del cliente
5. **Headers HSTS** - Fuerza HTTPS, válido por 1 año

---

## 📞 Soporte

Si algo no funciona:

1. **Revisar logs:**
   ```bash
   tail -f api/logs/php_errors.log
   tail -f api/logs/security.log
   ```

2. **Verificar BD:**
   ```sql
   SHOW TABLES LIKE 'rate_limits';
   SELECT COUNT(*) FROM rate_limits;
   ```

3. **Verificar .env:**
   ```bash
   grep JWT_SECRET .env
   grep DB_ .env
   ```

4. **Probar conectividad API:**
   ```bash
   curl -v https://tu-dominio.com/api/
   ```

---

**Versión:** 1.0
**Fecha:** 2026-02-23
**Estado:** ✅ Listo para producción
