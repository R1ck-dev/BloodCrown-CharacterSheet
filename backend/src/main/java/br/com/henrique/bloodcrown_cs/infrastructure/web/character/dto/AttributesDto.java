package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo AttributesDTO. Usado em request e response. */
public record AttributesDto(
    Integer forca,
    Integer destreza,
    Integer sabedoria,
    Integer inteligencia,
    Integer carisma,
    Integer constituicao
) {}
