package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityCategory;
import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityResource;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA de habilidade (tabela "abilities"). Preserva colunas, enums como varchar
 * (category com columnDefinition varchar(50)), TEXT na descrição e @BatchSize dos efeitos.
 */
@Entity
@Table(name = "abilities")
@Getter
@Setter
public class AbilityJpaEntity {

    @Id
    private String id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", columnDefinition = "varchar(50)")
    private AbilityCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type")
    private AbilityResource resourceType;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "current_uses")
    private Integer currentUses;

    @Column(name = "dice_roll")
    private String diceRoll;

    @OneToMany(mappedBy = "ability", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<AbilityEffectJpaEntity> effects = new ArrayList<>();

    @Column(name = "duration_dice")
    private String durationDice;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "turns_remaining")
    private Integer turnsRemaining;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterJpaEntity character;
}
