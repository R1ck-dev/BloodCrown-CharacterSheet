package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Objeto de Transferência de Dados (DTO) para representar um Ataque ou Arma.
 * Utilizado para trafegar informações sobre ações ofensivas entre o cliente e o servidor.
 * * @param id Identificador único do ataque.
 * @param name Nome da arma ou habilidade ofensiva (ex: "Espada Longa").
 * @param damageDice A notação de dados de dano (ex: "1d8+2").
 * @param description Detalhes adicionais ou efeitos do ataque.
 */
public record AttackDTO(
    String id,
    String name,
    String damageDice,
    String description
) {
    
}