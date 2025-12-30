package br.com.henrique.bloodcrown_cs.DTOs;

public record ItemDTO(
    String id,
    String name,
    String description,
    Boolean isEquipped,
    String targetAttribute,
    Integer effectValue
) {}
