package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * DTO composto utilizado exclusivamente para o processo de criação de um novo personagem.
 * Agrega todas as informações iniciais necessárias para instanciar uma nova ficha no sistema.
 * * @param name Nome do personagem.
 * @param characterClass Classe ou arquétipo escolhido.
 * @param attributes Objeto contendo a distribuição inicial de atributos.
 * @param expertise Objeto contendo os valores iniciais das perícias.
 * @param status Objeto contendo os valores iniciais de vida, mana e estamina.
 */
public record CreateCharacterDTO(
    String name,
    String characterClass,
    AttributesDTO attributes,
    ExpertiseDTO expertise,
    StatusDTO status
) {
    
}