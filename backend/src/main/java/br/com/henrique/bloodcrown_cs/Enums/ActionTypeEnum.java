package br.com.henrique.bloodcrown_cs.Enums;

import java.util.Map;

/**
 * Tipos de acao que uma habilidade pode consumir do pool por turno do personagem.
 * Hierarquia D&D-like: STANDARD pode substituir BONUS ou MOVEMENT;
 * BONUS pode substituir MOVEMENT; REACTION isolada; FREE nao consome.
 */
public enum ActionTypeEnum {
    STANDARD,
    BONUS,
    MOVEMENT,
    REACTION,
    FREE,
    /** Ação Completa — drena Padrão+Bônus+Movimento; exige pool intacto pra ativar. */
    FULL;

    /**
     * Mapeamento de valores legados (strings livres tipo "Acao bonus", "Padrao",
     * "Ação de Movimento") pro enum estrito. Cobre escrita com/sem acento,
     * minusculas e variantes comuns. Cai pra STANDARD se nao reconhecido.
     */
    private static final Map<String, ActionTypeEnum> LEGACY = Map.ofEntries(
        Map.entry("ação padrão", STANDARD), Map.entry("acao padrao", STANDARD),
        Map.entry("padrão", STANDARD),      Map.entry("padrao", STANDARD),
        Map.entry("standard", STANDARD),
        Map.entry("ação bônus", BONUS),     Map.entry("acao bonus", BONUS),
        Map.entry("bônus", BONUS),          Map.entry("bonus", BONUS),
        Map.entry("ação de movimento", MOVEMENT), Map.entry("acao de movimento", MOVEMENT),
        Map.entry("movimento", MOVEMENT),   Map.entry("movement", MOVEMENT),
        Map.entry("reação", REACTION),      Map.entry("reacao", REACTION),
        Map.entry("reaction", REACTION),
        Map.entry("livre", FREE),           Map.entry("free", FREE),
        Map.entry("ação livre", FREE),      Map.entry("acao livre", FREE),
        Map.entry("ação completa", FULL),   Map.entry("acao completa", FULL),
        Map.entry("completa", FULL),        Map.entry("full action", FULL),
        Map.entry("full", FULL)
    );

    /**
     * Normaliza qualquer string (enum literal ou legado em PT-BR) pra valor do enum.
     * Null/vazio cai pra STANDARD por seguranca.
     */
    public static ActionTypeEnum fromString(String raw) {
        if (raw == null || raw.isBlank()) return STANDARD;
        String trimmed = raw.trim();
        try {
            return ActionTypeEnum.valueOf(trimmed.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return LEGACY.getOrDefault(trimmed.toLowerCase(), STANDARD);
        }
    }

    /**
     * Hierarquia D&D-like: define se `this` (acao que o usuario quer gastar)
     * pode cobrir uma habilidade que exige `required`.
     * REACTION e FULL nao sao substituidos nem substituem outros.
     */
    public boolean canSubstitute(ActionTypeEnum required) {
        if (this == required) return true;
        if (required == REACTION || required == FULL) return false;
        if (this == REACTION || this == FREE || this == FULL) return false;
        if (this == STANDARD) return required == BONUS || required == MOVEMENT;
        if (this == BONUS) return required == MOVEMENT;
        return false;
    }
}
