package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/**
 * Patch parcial da ficha. Shape JSON idêntico ao antigo CharacterPatchDTO (sem listas —
 * attacks/abilities/inventory têm endpoints próprios). Campos null = no-op.
 */
public record CharacterPatchDto(
    String name,
    String characterClass,
    Integer level,
    AttributesDto attributes,
    StatusDto status,
    ExpertiseDto expertise,
    String money,
    Integer heroPoint,
    String biography,
    ActionPoolDto actionPool
) {}
