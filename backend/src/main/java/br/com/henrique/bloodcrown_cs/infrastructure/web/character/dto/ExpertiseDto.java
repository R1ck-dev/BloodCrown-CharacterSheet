package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo ExpertiseDTO. Usado em request e response. */
public record ExpertiseDto(
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
) {}
