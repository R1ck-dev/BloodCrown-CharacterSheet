package br.com.henrique.bloodcrown_cs.domain.character.enums;

/**
 * Categorias de habilidade. Persistido como String (varchar) — nomes precisam
 * permanecer idênticos aos valores já gravados no banco.
 */
public enum AbilityCategory {
    CLASS,
    MAGIC,
    AWAKEN,
    WEAPON,
    TRANSFORMATION,
    SPECIAL,
    INVENTORY,
    PASSIVE
}
