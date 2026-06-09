package br.com.henrique.bloodcrown_cs.domain.character.model;

/**
 * Recorte de leitura do status de uma ficha para o tabuleiro: só os campos que o token exibe
 * (vida atual/máxima, defesa e resistências) + identificação. Derivado do agregado via
 * {@link Character#toStatusSnapshot()} — defesa/resistências já são os totais EFETIVOS (com buffs
 * de habilidades ativas + itens equipados), não as bases persistidas.
 */
public record FichaStatusSnapshot(
        String characterId,
        String nome,
        Integer currentHealth,
        Integer maxHealth,
        Integer defense,
        Integer physicalRes,
        Integer magicalRes) {
}
