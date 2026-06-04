package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo AttackDTO. Usado em request e response. */
public record AttackDto(
    String id,
    String name,
    String damageDice,
    String description
) {}
