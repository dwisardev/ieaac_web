<?php
/**
 * Middleware Auth - Verificación de JWT y permisos
 * I.E. Andrés Avelino Cáceres
 */

require_once __DIR__ . '/../config/Security.php';
require_once __DIR__ . '/../config/Database.php';

class Auth {
    
    /**
     * Verificar token JWT desde headers
     */
    public static function verify() {
        // Obtener token del header Authorization
        // Compatible con cPanel y otros servidores
        $authHeader = '';

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            // Fallback para servidores que soportan getallheaders()
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (empty($authHeader)) {
            return [
                'success' => false,
                'error' => 'Token no proporcionado',
                'message' => 'Debe incluir el token en el header Authorization'
            ];
        }

        // Extraer token (formato: "Bearer TOKEN")
        $token = str_replace('Bearer ', '', $authHeader);
        $token = trim($token);

        if (empty($token)) {
            return [
                'success' => false,
                'error' => 'Token inválido',
                'message' => 'El formato del token es incorrecto'
            ];
        }
        
        // Verificar si el token está en blacklist
        if (self::isTokenBlacklisted($token)) {
            Security::logSecurityEvent('token_blacklisted', [
                'token' => substr($token, 0, 20) . '...'
            ]);
            
            return [
                'success' => false,
                'error' => 'Token revocado',
                'message' => 'Este token ha sido revocado'
            ];
        }
        
        // Verificar JWT
        $payload = Security::verifyJWT($token);
        
        if (!$payload) {
            return [
                'success' => false,
                'error' => 'Token inválido o expirado',
                'message' => 'Debe iniciar sesión nuevamente'
            ];
        }
        
        // Verificar que el usuario siga activo
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $query = "SELECT id, username, email, rol, activo 
                      FROM usuarios 
                      WHERE id = :id 
                      LIMIT 1";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $payload['userId']);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'error' => 'Usuario no encontrado',
                    'message' => 'El usuario ya no existe'
                ];
            }
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user['activo'] != 1) {
                return [
                    'success' => false,
                    'error' => 'Usuario inactivo',
                    'message' => 'Tu cuenta ha sido desactivada'
                ];
            }
            
            // Todo OK - retornar datos del usuario
            return [
                'success' => true,
                'data' => [
                    'userId' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'rol' => $user['rol']
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Error de autenticación',
                'message' => 'No se pudo verificar el usuario'
            ];
        }
    }
    
    /**
     * Verificar si el usuario tiene un rol específico
     */
    public static function hasRole($allowedRoles = []) {
        $auth = self::verify();
        
        if (!$auth['success']) {
            return $auth;
        }
        
        $userRole = $auth['data']['rol'];
        
        if (!in_array($userRole, $allowedRoles)) {
            return [
                'success' => false,
                'error' => 'Acceso denegado',
                'message' => 'No tienes permisos para realizar esta acción',
                'required_roles' => $allowedRoles,
                'your_role' => $userRole
            ];
        }
        
        return $auth;
    }
    
    /**
     * Agregar token a blacklist
     */
    public static function blacklistToken($token, $userId, $reason = null) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            // Hash del token para no almacenarlo completo
            $tokenHash = hash('sha256', $token);
            
            // Decodificar token para obtener expiración
            $payload = Security::verifyJWT($token);
            $expiresAt = $payload ? date('Y-m-d H:i:s', $payload['exp']) : date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $query = "INSERT INTO token_blacklist 
                      (token_hash, user_id, revoked_at, expires_at, reason) 
                      VALUES 
                      (:token_hash, :user_id, NOW(), :expires_at, :reason)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':expires_at', $expiresAt);
            $stmt->bindParam(':reason', $reason);
            
            return $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error al agregar token a blacklist: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verificar si un token está en blacklist
     */
    public static function isTokenBlacklisted($token) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $tokenHash = hash('sha256', $token);
            
            $query = "SELECT id FROM token_blacklist 
                      WHERE token_hash = :token_hash 
                      AND expires_at > NOW() 
                      LIMIT 1";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
            
        } catch (Exception $e) {
            error_log("Error al verificar blacklist: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Registrar intento de login
     */
    public static function logLoginAttempt($username, $success = false) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $query = "INSERT INTO login_attempts 
                      (username, ip, user_agent, success, created_at) 
                      VALUES 
                      (:username, :ip, :user_agent, :success, NOW())";
            
            $stmt = $db->prepare($query);
            
            $ip = Security::getClientIP();
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
            
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':user_agent', $userAgent);
            $stmt->bindParam(':success', $success, PDO::PARAM_INT);
            
            $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error al registrar intento de login: " . $e->getMessage());
        }
    }
    
    /**
     * Registrar login exitoso en historial
     */
    public static function logLoginHistory($userId) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $query = "INSERT INTO login_history 
                      (user_id, ip, user_agent, location, success, created_at) 
                      VALUES 
                      (:user_id, :ip, :user_agent, :location, 1, NOW())";
            
            $stmt = $db->prepare($query);
            
            $ip = Security::getClientIP();
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
            $location = null; // Aquí podrías agregar geolocalización por IP
            
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':user_agent', $userAgent);
            $stmt->bindParam(':location', $location);
            
            $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error al registrar historial de login: " . $e->getMessage());
        }
    }
    
    /**
     * Guardar refresh token
     */
    public static function saveRefreshToken($userId, $token, $expiresAt) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $tokenHash = hash('sha256', $token);
            
            $query = "INSERT INTO refresh_tokens 
                      (user_id, token_hash, expires_at, created_at) 
                      VALUES 
                      (:user_id, :token_hash, :expires_at, NOW())";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->bindParam(':expires_at', $expiresAt);
            
            return $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error al guardar refresh token: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verificar refresh token
     */
    public static function verifyRefreshToken($token) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $tokenHash = hash('sha256', $token);
            
            $query = "SELECT user_id, expires_at 
                      FROM refresh_tokens 
                      WHERE token_hash = :token_hash 
                      AND expires_at > NOW() 
                      LIMIT 1";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return $result['user_id'];
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Error al verificar refresh token: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Revocar refresh token
     */
    public static function revokeRefreshToken($token) {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $tokenHash = hash('sha256', $token);
            
            $query = "DELETE FROM refresh_tokens WHERE token_hash = :token_hash";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token_hash', $tokenHash);
            
            return $stmt->execute();
            
        } catch (Exception $e) {
            error_log("Error al revocar refresh token: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener usuario desde token
     */
    public static function getUserFromToken() {
        $auth = self::verify();
        
        if (!$auth['success']) {
            return null;
        }
        
        return $auth['data'];
    }
}