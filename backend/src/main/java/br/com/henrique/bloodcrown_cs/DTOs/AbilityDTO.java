package br.com.henrique.bloodcrown_cs.DTOs;

import java.util.List;

import br.com.henrique.bloodcrown_cs.Enums.AbilityCategoryEnum;
import br.com.henrique.bloodcrown_cs.Enums.AbilityResourceEnum;

public record AbilityDTO(
    String id,
    String name,
    AbilityCategoryEnum category,
    AbilityResourceEnum resourceType,
    String actionType,
    Integer maxUses,
    Integer currentUses,
    String diceRoll,
    List<EffectDTO> effects,
    String durationDice,
    Boolean isActive,
    Integer turnsRemaining,
    String description
) {
    
}
