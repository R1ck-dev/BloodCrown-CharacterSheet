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
 * Entidade JPA de item (tabela "items"). Preserva is_equipped (default false),
 * quantity (INT DEFAULT 1) e descrição em TEXT do antigo ItemModel.
 */
@Entity
@Table(name = "items")
@Getter
@Setter
public class ItemJpaEntity {

    @Id
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_equipped")
    private Boolean isEquipped = false;

    @Column(name = "target_attribute")
    private String targetAttribute;

    @Column(name = "effect_value")
    private Integer effectValue;

    @Column(name = "quantity", columnDefinition = "INT DEFAULT 1")
    private Integer quantity = 1;

    @Column(name = "use_dice")
    private String useDice;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterJpaEntity character;
}
