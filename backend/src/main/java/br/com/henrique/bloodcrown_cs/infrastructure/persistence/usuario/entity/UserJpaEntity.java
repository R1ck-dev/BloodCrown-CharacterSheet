package br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity;

import br.com.henrique.bloodcrown_cs.domain.usuario.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA do usuário. Mapeia a tabela "users" preservando exatamente as colunas
 * do antigo UserModel (id, username, password_hash, roles). O id é atribuído pelo
 * domínio (UUID), por isso não há @GeneratedValue.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
public class UserJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "username", length = 25, unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "roles", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;
}
