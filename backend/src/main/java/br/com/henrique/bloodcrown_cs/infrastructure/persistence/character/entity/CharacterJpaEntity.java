package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.ActionPoolEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.AttributesEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.ExpertiseEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.StatusEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.entity.FolderJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA da ficha (tabela "characters"). Preserva exatamente as colunas, embeddables,
 * relacionamentos e @BatchSize do antigo CharacterModel. Id atribuído pelo domínio.
 */
@Entity
@Table(name = "characters")
@Getter
@Setter
public class CharacterJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserJpaEntity user;

    @ManyToOne
    @JoinColumn(name = "folder_id", nullable = true)
    private FolderJpaEntity folder;

    @Column(name = "name")
    private String name;

    @Column(name = "char_class")
    private String characterClass;

    @Column(name = "level")
    private Integer level;

    @Embedded
    private AttributesEmbeddable attributes;

    @Embedded
    private StatusEmbeddable status;

    @Embedded
    private ExpertiseEmbeddable expertise;

    @Embedded
    private ActionPoolEmbeddable actionPool;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<AttackJpaEntity> attacks = new ArrayList<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<AbilityJpaEntity> abilities = new ArrayList<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<ItemJpaEntity> inventory = new ArrayList<>();

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<CustomSkillJpaEntity> customSkills = new ArrayList<>();

    @Column(name = "money")
    private String money;

    @Column(name = "heroi_point")
    private Integer heroPoint;

    @Column(name = "biography", columnDefinition = "TEXT")
    private String biography;
}
