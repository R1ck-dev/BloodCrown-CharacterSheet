package br.com.henrique.bloodcrown_cs.application.character.dto;

import java.util.List;

import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityCategory;
import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityResource;

/**
 * Dados de definição de uma habilidade (estado de runtime — usos/ativação/turnos —
 * é gerido pelo domínio, não vem no input).
 */
public record HabilidadeInput(
    String name,
    AbilityCategory category,
    AbilityResource resourceType,
    String actionType,
    Integer maxUses,
    String diceRoll,
    List<EffectInput> effects,
    String durationDice,
    String description
) {}
