package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

/**
 * Pool de acoes por turno do personagem.
 * Cada ativacao de habilidade consome 1 do contador correspondente; "Passar Turno"
 * reseta todos pros maximos. Acoes Livres nao tem campo (infinitas).
 */
@Embeddable
@Data
public class CharacterActionPool {

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
