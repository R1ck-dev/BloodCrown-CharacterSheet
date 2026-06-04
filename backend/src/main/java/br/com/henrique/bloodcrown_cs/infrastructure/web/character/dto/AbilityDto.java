package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

import java.util.List;

import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityCategory;
import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityResource;

/**
 * Shape JSON idêntico ao antigo AbilityDTO. Usado em request (add/update — campos de
 * runtime ignorados) e response. Enums serializam pelo nome (mesmos valores de antes).
 */
public record AbilityDto(
    String id,
    String name,
    AbilityCategory category,
    AbilityResource resourceType,
    String actionType,
    Integer maxUses,
    Integer currentUses,
    String diceRoll,
    List<EffectDto> effects,
    String durationDice,
    Boolean isActive,
    Integer turnsRemaining,
    String description
) {}
