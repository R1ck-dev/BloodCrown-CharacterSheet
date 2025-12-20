package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import java.util.List;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;

public record CharacterDTO(
    String id, 
    String name, 
    String characterClass, 
    Integer level,
    List<AttackDTO> attacks
) {
    
}
