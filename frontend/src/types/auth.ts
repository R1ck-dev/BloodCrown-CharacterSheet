/**
 * Tipos de autenticacao — mapeiam DTOs Java de auth:
 *   backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/LoginDTO.java
 *   backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/RegisterDTO.java
 *   backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/Responses/ToLoginDTO.java
 *   backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/Responses/ToRegisterDTO.java
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
}
