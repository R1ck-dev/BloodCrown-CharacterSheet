package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

import java.util.List;

/**
 * Resumo de ficha para listagens/criação. Shape JSON idêntico ao antigo
 * Responses/CharacterDTO (inclui folderId; null = raiz).
 */
public record CharacterSummaryDto(
    String id,
    String name,
    String characterClass,
    Integer level,
    List<AttackDto> attacks,
    Integer currentHealth,
    Integer maxHealth,
    String folderId
) {}
