package br.com.henrique.bloodcrown_cs.DTOs;

import java.util.List;

import br.com.henrique.bloodcrown_cs.Enums.AbilityCategoryEnum;
import br.com.henrique.bloodcrown_cs.Enums.AbilityResourceEnum;

/**
 * Representa uma Habilidade, Magia ou Técnica Especial do personagem.
 * Contém regras de negócio para execução, como custos de recursos, rolagens de dados
 * e efeitos aplicáveis.
 * * @param id Identificador único da habilidade.
 * @param name Nome da habilidade.
 * @param category Categoria (ex: Passiva, Ativa, Reação).
 * @param resourceType Tipo de recurso consumido (ex: MANA, STAMINA).
 * @param actionType Tipo de ação necessária (ex: Ação Padrão, Bonus).
 * @param maxUses Limite de usos (se aplicável).
 * @param currentUses Quantidade de usos restantes.
 * @param diceRoll Fórmula de rolagem de dados associada (ex: "2d6+4").
 * @param effects Lista de efeitos mecânicos que a habilidade aplica.
 * @param durationDice Duração do efeito (em turnos ou tempo).
 * @param isActive Indica se a habilidade está atualmente ativa ou em cooldown.
 * @param turnsRemaining Turnos restantes para recarga ou fim do efeito.
 * @param description Texto explicativo da habilidade.
 */
public record AbilityDTO(
    String id,
    String name,
    AbilityCategoryEnum category,
    AbilityResourceEnum resourceType,
    String actionType,
    Integer maxUses,
    Integer currentUses,
    String diceRoll,
    List<EffectDTO> effects,
    String durationDice,
    Boolean isActive,
    Integer turnsRemaining,
    String description
) {
    
}