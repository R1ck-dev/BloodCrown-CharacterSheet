package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo StatusDTO. Usado em request e response. */
public record StatusDto(
    Integer maxHealth,
    Integer currentHealth,
    Integer maxSanity,
    Integer currentSanity,
    Integer maxMana,
    Integer currentMana,
    Integer maxStamina,
    Integer currentStamina,
    Integer defense,
    Integer defenseBase,
    Integer armorBonus,
    Integer otherBonus,
    Integer physicalRes,
    Integer magicalRes
) {}
