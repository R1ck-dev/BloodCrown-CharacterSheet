package br.com.henrique.bloodcrown_cs.DTOs;

import br.com.henrique.bloodcrown_cs.Enums.AbilityCategoryEnum;

public record AbilityDTO(
    String id,
    String name,
    AbilityCategoryEnum category,
    String actionType,
    Integer maxUses,
    Integer currentUses,
    String diceRoll,
    String targetAttribute,
    Integer effectValue,
    String durationDice,
    Boolean isActive,
    Integer turnsRemaining,
    String description
) {
    
}
