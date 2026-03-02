# 🚀 QUICK START - 5 MINUTOS A PRODUCCIÓN

## 1. Crear tabla rate_limits (1 min)

**Opción A: Via phpMyAdmin**
1. Abre phpMyAdmin
2. Selecciona tu base de datos `ieandres_db`
3. Haz click en SQL
4. Copia y pega el contenido de `api/migrations/001_create_rate_limits_table.sql`
5. Haz click en "Continuar"

**Opción B: Via terminal**
```bash
mysql -u ieandres_demosirena -p ieandres_db < api/migrations/001_create_rate_limits_table.sql
```

## 2. Verificar .env (1 min)

```bash
# Abre .env en la raíz del proyecto
nano .env

# Verifica que tenga:
JWT_SECRET=ALGO_DE_32_CARACTERES_RANDOM
# Si dice "secret_key_change_me" CAMBIALO

# Ejemplo de JWT_SECRET seguro:
# JWT_SECRET=aB3cD5eF7gH9iJ1kL3mN5oP7qR9sT1uV

SECURITY_LOG_ENABLED=true
```

## 3. Establecer permisos (1 min)

```bash
chmod 755 api/logs/
chmod 755 api/public/uploads/
```

## 4. Probar instalación (1 min)

**Accede a este URL en el navegador:**
```
https://tu-dominio.com/api/diagnostic.php
```

**Deberías ver: "status": "ok"**

Si ves "error" o "warning", sigue las instrucciones para arreglarlo.

## 5. ¡Listo! (1 min)

Ahora todo debería funcionar. El admin-panel puede:
- ✅ Login
- ✅ Ver noticias
- ✅ Crear/editar/eliminar (con CSRF protection)
- ✅ Rate limiting automático (5 intentos = bloqueo)

---

## ❌ Si algo falla

Ver `INSTALACION.md` para solucionar problemas específicos.

---

## 📋 Archivos importantes

| Archivo | Propósito |
|---------|-----------|
| `INSTALACION.md` | Guía completa de instalación |
| `SECURITY_FIXES_REPORT.md` | Reporte de todas las correcciones |
| `api/diagnostic.php` | Script para validar configuración |
| `api/RATE_LIMITING_SETUP.md` | Detalles de rate limiting |

---

**¿Todo ok?** → Procede a producción
**¿Algo roto?** → Revisa `INSTALACION.md` sección "SI VES ERRORES"
