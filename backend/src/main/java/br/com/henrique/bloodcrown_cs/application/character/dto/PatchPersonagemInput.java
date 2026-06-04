package br.com.henrique.bloodcrown_cs.application.character.dto;

import br.com.henrique.bloodcrown_cs.domain.character.model.ActionPool;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attributes;
import br.com.henrique.bloodcrown_cs.domain.character.model.Expertise;
import br.com.henrique.bloodcrown_cs.domain.character.model.Status;

/**
 * Payload do PATCH parcial da ficha. Todos os campos opcionais (null = no-op),
 * inclusive os campos internos dos value objects.
 */
public record PatchPersonagemInput(
    String name,
    String characterClass,
    Integer level,
    String money,
    Integer heroPoint,
    String biography,
    Attributes attributes,
    Status status,
    Expertise expertise,
    ActionPool actionPool
) {}
