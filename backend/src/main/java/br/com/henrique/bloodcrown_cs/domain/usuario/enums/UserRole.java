package br.com.henrique.bloodcrown_cs.domain.usuario.enums;

/**
 * Papel/nível de acesso do usuário. O nome do enum é persistido como String
 * (coluna {@code roles}) e usado como authority no contexto de segurança.
 */
public enum UserRole {
    ROLE_USER,
    ROLE_ADMIN
}
