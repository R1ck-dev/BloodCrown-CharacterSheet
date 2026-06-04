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
 * Entidade JPA de ataque (tabela "attacks"). Coluna damage_dice via naming default
 * (campo damageDice sem name), descrição em TEXT — idêntico ao antigo AttackModel.
 */
@Entity
@Table(name = "attacks")
@Getter
@Setter
public class AttackJpaEntity {

    @Id
    private String id;

    @Column
    private String name;

    @Column
    private String damageDice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterJpaEntity character;
}
