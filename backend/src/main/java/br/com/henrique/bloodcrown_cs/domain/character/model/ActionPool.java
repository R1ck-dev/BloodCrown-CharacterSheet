package br.com.henrique.bloodcrown_cs.domain.character.model;

import lombok.Getter;
import lombok.Setter;

/**
 * Value object do pool de ações por turno. Data holder mutável; as regras de consumo
 * e reset vivem na raiz {@link Character}.
 */
@Getter
@Setter
public class ActionPool {
    private Integer maxStandard;
    private Integer currentStandard;
    private Integer maxBonus;
    private Integer currentBonus;
    private Integer maxMovement;
    private Integer currentMovement;
    private Integer maxReaction;
    private Integer currentReaction;

    /**
     * Pool default D&D-like (1 Padrão, 3 Bônus, 1 Movimento, 2 Reação),
     * com current = max. Usado na criação e como retrocompat de fichas antigas.
     */
    public static ActionPool padrao() {
        ActionPool pool = new ActionPool();
        pool.maxStandard = 1;  pool.currentStandard = 1;
        pool.maxBonus = 3;     pool.currentBonus = 3;
        pool.maxMovement = 1;  pool.currentMovement = 1;
        pool.maxReaction = 2;  pool.currentReaction = 2;
        return pool;
    }
}
