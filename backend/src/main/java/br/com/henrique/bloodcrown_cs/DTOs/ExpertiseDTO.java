package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Representa o conjunto completo de Perícias (Skills) de um personagem.
 * Cada campo armazena o valor numérico (bônus) associado à respectiva competência.
 * Utilizado para persistência e visualização na ficha.
 */
public record ExpertiseDTO(
    Integer atletismo,
    Integer conhecimento,
    Integer consertar,
    Integer diplomacia,
    Integer domar,
    Integer empatia,
    Integer fortitude,
    Integer furtividade,
    Integer magia,
    Integer iniciativa,
    Integer intimidar,
    Integer intuicao,
    Integer investigacao,
    Integer labia,
    Integer ladinagem,
    Integer luta,
    Integer medicina,
    Integer mente,
    Integer percepcao,
    Integer pontaria,
    Integer reflexos,
    Integer seduzir,
    Integer sobrevivencia
) {
    
}