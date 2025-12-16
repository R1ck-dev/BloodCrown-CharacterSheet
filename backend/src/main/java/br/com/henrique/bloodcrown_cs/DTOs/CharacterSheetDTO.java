package br.com.henrique.bloodcrown_cs.DTOs;

public record CharacterSheetDTO(
    String id,
    String name,
    String characterClass,
    Integer level,
    AttributesDTO attributes,
    StatusDTO status,
    ExpertiseDTO expertise
) {
    
}
