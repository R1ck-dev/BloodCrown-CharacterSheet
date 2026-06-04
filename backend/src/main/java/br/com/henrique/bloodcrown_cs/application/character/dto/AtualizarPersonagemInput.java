package br.com.henrique.bloodcrown_cs.application.character.dto;

import br.com.henrique.bloodcrown_cs.domain.character.model.ActionPool;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attributes;
import br.com.henrique.bloodcrown_cs.domain.character.model.Expertise;
import br.com.henrique.bloodcrown_cs.domain.character.model.Status;

/**
 * Payload do PUT da ficha. Os value objects vêm já no formato de domínio (montados
 * pelo controller a partir do request web); sub-objetos null = não mexe.
 */
public record AtualizarPersonagemInput(
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
