package br.com.henrique.bloodcrown_cs.application.character.dto;

public record ItemInput(
    String name,
    String description,
    String targetAttribute,
    Integer effectValue,
    Integer quantity,
    String useDice
) {}
