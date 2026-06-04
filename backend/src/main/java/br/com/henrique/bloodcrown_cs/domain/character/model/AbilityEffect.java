package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Sub-entidade: um efeito mecânico de uma habilidade (target + valor).
 */
@Getter
@Setter
public class AbilityEffect {
    private String id;
    private String targetAttribute;
    private Integer effectValue;

    /** Cria um novo efeito já com id gerado. */
    public static AbilityEffect create(String targetAttribute, Integer effectValue) {
        AbilityEffect e = new AbilityEffect();
        e.id = UUID.randomUUID().toString();
        e.targetAttribute = targetAttribute;
        e.effectValue = effectValue;
        return e;
    }
}
