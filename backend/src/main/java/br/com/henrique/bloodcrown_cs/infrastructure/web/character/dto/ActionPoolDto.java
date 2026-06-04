package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo ActionPoolDTO. Usado em request e response. */
public record ActionPoolDto(
    Integer maxStandard,  Integer currentStandard,
    Integer maxBonus,     Integer currentBonus,
    Integer maxMovement,  Integer currentMovement,
    Integer maxReaction,  Integer currentReaction
) {}
