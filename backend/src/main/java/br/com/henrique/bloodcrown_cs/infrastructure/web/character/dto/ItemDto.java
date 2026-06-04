package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Shape JSON idêntico ao antigo ItemDTO. Usado em request e response. */
public record ItemDto(
    String id,
    String name,
    String description,
    Boolean isEquipped,
    String targetAttribute,
    Integer effectValue,
    Integer quantity,
    String useDice
) {}
