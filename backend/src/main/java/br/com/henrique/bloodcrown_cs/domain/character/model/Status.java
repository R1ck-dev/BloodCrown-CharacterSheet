package br.com.henrique.bloodcrown_cs.domain.character.model;

import lombok.Getter;
import lombok.Setter;

/**
 * Value object dos recursos vitais e defesas do personagem. Data holder mutável.
 */
@Getter
@Setter
public class Status {
    private Integer maxHealth;
    private Integer currentHealth;
    private Integer maxSanity;
    private Integer currentSanity;
    private Integer maxMana;
    private Integer currentMana;
    private Integer maxStamina;
    private Integer currentStamina;
    private Integer defense;
    private Integer defenseBase;
    private Integer armorBonus;
    private Integer otherBonus;
    private Integer physicalRes;
    private Integer magicalRes;
}
