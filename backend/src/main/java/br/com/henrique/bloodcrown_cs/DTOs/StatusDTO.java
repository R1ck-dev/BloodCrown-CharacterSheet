package br.com.henrique.bloodcrown_cs.DTOs;

public record StatusDTO(
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
    Integer otherBonus
) {
} 
