package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

/**
 * Embeddable JPA do pool de ações — colunas idênticas ao antigo CharacterActionPool.
 */
@Embeddable
@Getter
@Setter
public class ActionPoolEmbeddable {
    @Column(name = "max_standard")
    private Integer maxStandard;
    @Column(name = "current_standard")
    private Integer currentStandard;
    @Column(name = "max_bonus")
    private Integer maxBonus;
    @Column(name = "current_bonus")
    private Integer currentBonus;
    @Column(name = "max_movement")
    private Integer maxMovement;
    @Column(name = "current_movement")
    private Integer currentMovement;
    @Column(name = "max_reaction")
    private Integer maxReaction;
    @Column(name = "current_reaction")
    private Integer currentReaction;
}
