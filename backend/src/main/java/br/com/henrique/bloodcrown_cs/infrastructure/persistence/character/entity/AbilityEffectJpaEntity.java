package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA de efeito de habilidade (tabela "ability_effects").
 */
@Entity
@Table(name = "ability_effects")
@Getter
@Setter
public class AbilityEffectJpaEntity {

    @Id
    private String id;

    @Column(name = "target_attribute")
    private String targetAttribute;

    @Column(name = "effect_value")
    private Integer effectValue;

    @ManyToOne
    @JoinColumn(name = "ability_id")
    private AbilityJpaEntity ability;
}
