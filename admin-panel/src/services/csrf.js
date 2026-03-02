/**
 * CSRF Token Service
 * Gestiona tokens CSRF para proteger contra ataques de falsificación de solicitud entre sitios
 */

class CSRFTokenService {
  // Constantes privadas (usando convención _)
  static TOKEN_NAME = 'X-CSRF-Token';
  static SESSION_TOKEN = 'csrf_token';
  static TOKEN_LENGTH = 32;

  /**
   * Generar un nuevo token CSRF
   */
  static generateToken() {
    // Si ya tenemos un token en sessionStorage, reutilizarlo
    const existingToken = sessionStorage.getItem(this.SESSION_TOKEN);
    if (existingToken) {
      return existingToken;
    }

    // Generar nuevo token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(this.TOKEN_LENGTH)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    sessionStorage.setItem(this.SESSION_TOKEN, token);
    return token;
  }

  /**
   * Obtener el token actual
   */
  static getToken() {
    let token = sessionStorage.getItem(this.SESSION_TOKEN);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }

  /**
   * Agregar token a headers de solicitud
   */
  static getHeaders() {
    return {
      [this.TOKEN_NAME]: this.getToken()
    };
  }

  /**
   * Validar token (principalmente para servidor)
   */
  static validateToken(token) {
    const storedToken = sessionStorage.getItem(this.SESSION_TOKEN);
    return token && storedToken && token === storedToken;
  }
}

export default CSRFTokenService;
