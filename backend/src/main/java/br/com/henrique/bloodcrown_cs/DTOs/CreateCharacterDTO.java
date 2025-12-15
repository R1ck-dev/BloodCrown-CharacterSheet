package br.com.henrique.bloodcrown_cs.DTOs;

public record CreateCharacterDTO(
    String name,
    String characterClass,
    AttributesDTO attributes,
    ExpertiseDTO expertise,
    StatusDTO status
) {
    
}
