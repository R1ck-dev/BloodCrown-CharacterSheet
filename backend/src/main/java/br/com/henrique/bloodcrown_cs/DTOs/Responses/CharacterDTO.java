package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import java.util.List;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;

/**
 * Define uma representação simplificada de um Personagem, geralmente utilizada em listagens ou resumos.
 * Utiliza o recurso de Records do Java para garantir a imutabilidade dos dados transportados.
 * * @param id Identificador único do personagem.
 * @param name Nome do personagem.
 * @param characterClass Classe ou arquétipo do personagem.
 * @param level Nível atual.
 * @param attacks Lista resumida de ataques disponíveis.
 */
public record CharacterDTO(
    String id, 
    String name, 
    String characterClass, 
    Integer level,
    List<AttackDTO> attacks
) {
    
}