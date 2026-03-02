<?php
/**
 * Modelo User - Gestión de usuarios
 * I.E. Andrés Avelino Cáceres
 * 
 * CORRECCIONES APLICADAS:
 * - Propiedad $nombre agregada
 * - Campo 'nombre' incluido en todos los SELECT, INSERT y UPDATE
 */

class User {
    private $conn;
    private $table_name = "usuarios";
    
    // Propiedades del usuario
    public $id;
    public $nombre;      // ✅ AGREGADO
    public $username;
    public $email;
    public $password;
    public $rol;
    public $activo;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Buscar usuario por username
     */
    public function findByUsername($username) {
        $query = "SELECT id, nombre, username, email, password, rol, activo, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE username = :username 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id         = $row['id'];
            $this->nombre     = $row['nombre'];     // ✅ AGREGADO
            $this->username   = $row['username'];
            $this->email      = $row['email'];
            $this->password   = $row['password'];
            $this->rol        = $row['rol'];
            $this->activo     = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return $row;
        }
        
        return false;
    }
    
    /**
     * Buscar usuario por email
     */
    public function findByEmail($email) {
        $query = "SELECT id, nombre, username, email, password, rol, activo, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id         = $row['id'];
            $this->nombre     = $row['nombre'];     // ✅ AGREGADO
            $this->username   = $row['username'];
            $this->email      = $row['email'];
            $this->password   = $row['password'];
            $this->rol        = $row['rol'];
            $this->activo     = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return $row;
        }
        
        return false;
    }
    
    /**
     * Buscar usuario por ID
     */
    public function findById($id) {
        $query = "SELECT id, nombre, username, email, password, rol, activo, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id         = $row['id'];
            $this->nombre     = $row['nombre'];     // ✅ AGREGADO
            $this->username   = $row['username'];
            $this->email      = $row['email'];
            $this->password   = $row['password'];
            $this->rol        = $row['rol'];
            $this->activo     = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return $row;
        }
        
        return false;
    }
    
    /**
     * Verificar contraseña
     */
    public function verifyPassword($password) {
        return password_verify($password, $this->password);
    }
    
    /**
     * Verificar si el usuario está activo
     */
    public function isActive() {
        return $this->activo == 1;
    }
    
    /**
     * Crear nuevo usuario
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  (nombre, username, email, password, rol, activo)
                  VALUES
                  (:nombre, :username, :email, :password, :rol, :activo)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar datos
        $this->nombre   = htmlspecialchars(strip_tags($this->nombre));   // ✅ AGREGADO
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email    = htmlspecialchars(strip_tags($this->email));
        $this->password = Security::hashPassword($this->password);
        $this->rol      = htmlspecialchars(strip_tags($this->rol));
        $this->activo   = $this->activo ?? 1;
        
        // Bind valores
        $stmt->bindParam(':nombre',   $this->nombre);   // ✅ AGREGADO
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email',    $this->email);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindParam(':rol',      $this->rol);
        $stmt->bindParam(':activo',   $this->activo);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Actualizar usuario
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET nombre   = :nombre,
                      username = :username,
                      email    = :email,
                      rol      = :rol,
                      activo   = :activo
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitizar
        $this->nombre   = htmlspecialchars(strip_tags($this->nombre));   // ✅ AGREGADO
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email    = htmlspecialchars(strip_tags($this->email));
        $this->rol      = htmlspecialchars(strip_tags($this->rol));
        $this->id       = htmlspecialchars(strip_tags($this->id));
        
        // Bind
        $stmt->bindParam(':nombre',   $this->nombre);   // ✅ AGREGADO
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email',    $this->email);
        $stmt->bindParam(':rol',      $this->rol);
        $stmt->bindParam(':activo',   $this->activo);
        $stmt->bindParam(':id',       $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Actualizar contraseña
     */
    public function updatePassword($newPassword) {
        $query = "UPDATE " . $this->table_name . "
                  SET password = :password
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $hashedPassword = Security::hashPassword($newPassword);
        
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':id',       $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Eliminar usuario (soft delete)
     */
    public function delete() {
        $query = "UPDATE " . $this->table_name . "
                  SET activo = 0
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Listar todos los usuarios
     */
    public function getAll($filters = []) {
        $query = "SELECT id, nombre, username, email, rol, activo, created_at, updated_at 
                  FROM " . $this->table_name;
        
        $conditions = [];
        $params = [];
        
        // Filtrar por rol
        if (isset($filters['rol'])) {
            $conditions[] = "rol = :rol";
            $params[':rol'] = $filters['rol'];
        }
        
        // Filtrar por activo
        if (isset($filters['activo'])) {
            $conditions[] = "activo = :activo";
            $params[':activo'] = $filters['activo'];
        }
        
        if (count($conditions) > 0) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Contar usuarios
     */
    public function count($filters = []) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        
        $conditions = [];
        $params = [];
        
        if (isset($filters['rol'])) {
            $conditions[] = "rol = :rol";
            $params[':rol'] = $filters['rol'];
        }
        
        if (isset($filters['activo'])) {
            $conditions[] = "activo = :activo";
            $params[':activo'] = $filters['activo'];
        }
        
        if (count($conditions) > 0) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['total'];
    }
    
    /**
     * Validar datos de usuario
     */
    public function validate($data, $isUpdate = false) {
        $errors = [];
        
        // Validar nombre  ✅ AGREGADO
        if (!$isUpdate && empty($data['nombre'])) {
            $errors[] = "El nombre es requerido";
        } elseif (!empty($data['nombre'])) {
            if (mb_strlen($data['nombre']) < 2) {
                $errors[] = "El nombre debe tener al menos 2 caracteres";
            }
            if (mb_strlen($data['nombre']) > 255) {
                $errors[] = "El nombre no puede exceder 255 caracteres";
            }
        }

        // Validar username
        if (!$isUpdate && empty($data['username'])) {
            $errors[] = "El nombre de usuario es requerido";
        } elseif (!empty($data['username'])) {
            if (strlen($data['username']) < 3) {
                $errors[] = "El nombre de usuario debe tener al menos 3 caracteres";
            }
            if (strlen($data['username']) > 50) {
                $errors[] = "El nombre de usuario no puede exceder 50 caracteres";
            }
            if (!preg_match('/^[a-zA-Z0-9._-]+$/', $data['username'])) {
                $errors[] = "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos";
            }
        }
        
        // Validar email
        if (!$isUpdate && empty($data['email'])) {
            $errors[] = "El email es requerido";
        } elseif (!empty($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "El email no es válido";
            }
        }
        
        // Validar password (solo en creación o si se proporciona)
        if (!$isUpdate && empty($data['password'])) {
            $errors[] = "La contraseña es requerida";
        } elseif (!empty($data['password'])) {
            $passwordValidation = Security::validatePasswordStrength($data['password']);
            if (!$passwordValidation['valid']) {
                $errors = array_merge($errors, $passwordValidation['errors']);
            }
        }
        
        // Validar rol
        if (!empty($data['rol'])) {
            $rolesValidos = ['admin', 'editor', 'docente', 'usuario'];
            if (!in_array($data['rol'], $rolesValidos)) {
                $errors[] = "El rol especificado no es válido";
            }
        }
        
        return [
            'valid'  => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Verificar si username ya existe
     */
    public function usernameExists($username, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE username = :username";
        
        if ($excludeId) {
            $query .= " AND id != :excludeId";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        
        if ($excludeId) {
            $stmt->bindParam(':excludeId', $excludeId);
        }
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Verificar si email ya existe
     */
    public function emailExists($email, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email";
        
        if ($excludeId) {
            $query .= " AND id != :excludeId";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        
        if ($excludeId) {
            $stmt->bindParam(':excludeId', $excludeId);
        }
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Obtener datos públicos del usuario (sin contraseña)
     */
    public function getPublicData() {
        return [
            'id'         => $this->id,
            'nombre'     => $this->nombre,      // ✅ AGREGADO
            'username'   => $this->username,
            'email'      => $this->email,
            'rol'        => $this->rol,
            'activo'     => $this->activo,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}