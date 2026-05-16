package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * DTO do pool de acoes por turno do personagem.
 * Cada par (max, current) representa o limite e o quanto sobrou pra gastar no turno atual.
 * Acoes Livres nao tem campo (sao infinitas).
 *
 * @param maxStandard     Limite de Acoes Padrao por turno.
 * @param currentStandard Acoes Padrao restantes no turno.
 * @param maxBonus        Limite de Acoes Bonus por turno.
 * @param currentBonus    Acoes Bonus restantes no turno.
 * @param maxMovement     Limite de Acoes de Movimento por turno.
 * @param currentMovement Acoes de Movimento restantes no turno.
 * @param maxReaction     Limite de Reacoes por turno.
 * @param currentReaction Reacoes restantes no turno.
 */
public record ActionPoolDTO(
    Integer maxStandard,  Integer currentStandard,
    Integer maxBonus,     Integer currentBonus,
    Integer maxMovement,  Integer currentMovement,
    Integer maxReaction,  Integer currentReaction
) {
}
