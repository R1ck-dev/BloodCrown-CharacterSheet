package br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.entity;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA da pasta. Mapeia "folders" preservando as colunas do antigo FolderModel.
 * Id atribuído pelo domínio (sem @GeneratedValue).
 */
@Entity
@Table(name = "folders")
@Getter
@Setter
public class FolderJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "name", length = 60, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;
}
