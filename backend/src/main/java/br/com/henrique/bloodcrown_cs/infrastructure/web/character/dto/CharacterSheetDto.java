package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

import java.util.List;

/**
 * Ficha completa. Shape JSON idêntico ao antigo CharacterSheetDTO — serve de response
 * (GET e endpoints de side-effect) e de request (PUT).
 */
public record CharacterSheetDto(
    String id,
    String name,
    String characterClass,
    Integer level,
    AttributesDto attributes,
    StatusDto status,
    ExpertiseDto expertise,
    List<AttackDto> attacks,
    List<AbilityDto> abilities,
    List<ItemDto> inventory,
    List<CustomSkillDto> customSkills,
    String money,
    Integer heroPoint,
    String biography,
    ActionPoolDto actionPool
) {}
