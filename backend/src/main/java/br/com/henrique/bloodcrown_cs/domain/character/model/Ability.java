package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityCategory;
import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityResource;

import lombok.Getter;
import lombok.Setter;

/**
 * Sub-entidade: habilidade/magia/técnica. Estado de runtime (currentUses, isActive,
 * turnsRemaining) e definição convivem aqui; as regras de ativação/recarga vivem
 * na raiz {@link Character}, que orquestra esta entidade junto do pool e do status.
 */
@Getter
@Setter
public class Ability {
    private String id;
    private String name;
    private AbilityCategory category;
    private AbilityResource resourceType;
    private String actionType;
    private Integer maxUses;
    private Integer currentUses;
    private String diceRoll;
    private List<AbilityEffect> effects = new ArrayList<>();
    private String durationDice;
    private Boolean isActive;
    private Integer turnsRemaining;
    private String description;

    /** Cria uma nova habilidade já com id gerado (sem efeitos; estado inicial inativo). */
    public static Ability create() {
        Ability a = new Ability();
        a.id = UUID.randomUUID().toString();
        a.effects = new ArrayList<>();
        return a;
    }
}
