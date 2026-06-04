package br.com.henrique.bloodcrown_cs.domain.usuario.model;

import java.util.UUID;

import br.com.henrique.bloodcrown_cs.domain.usuario.enums.UserRole;

/**
 * Modelo de domínio do usuário. POJO puro, sem dependência de JPA ou Spring
 * (diferente do antigo UserModel, que implementava UserDetails). A integração
 * com o Spring Security vive na camada de infraestrutura (adapters de segurança).
 */
public class User {

    private final String id;
    private final String username;
    private final String passwordHash;
    private final UserRole role;

    /**
     * Construtor de criação — gera o id (UUID) quando ausente.
     */
    public User(String id, String username, String passwordHash, UserRole role) {
        this.id = (id != null && !id.isBlank()) ? id : UUID.randomUUID().toString();
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /**
     * Cria um novo usuário com papel padrão. Mantém ROLE_ADMIN temporariamente,
     * espelhando o comportamento atual do registro.
     */
    public static User registrar(String username, String passwordHash) {
        return new User(null, username, passwordHash, UserRole.ROLE_ADMIN);
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }
}
