package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo CustomSkillDTO. Usado em request e response. */
public record CustomSkillDto(
    String id,
    String name,
    String attribute,
    Integer value
) {}
