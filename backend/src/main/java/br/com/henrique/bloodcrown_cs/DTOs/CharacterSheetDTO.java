package br.com.henrique.bloodcrown_cs.DTOs;

import java.util.List;

public record CharacterSheetDTO(
    String id,
    String name,
    String characterClass,
    Integer level,
    AttributesDTO attributes,
    StatusDTO status,
    ExpertiseDTO expertise,
    List<AttackDTO> attacks,
    List<AbilityDTO> abilities
) {
    
}
