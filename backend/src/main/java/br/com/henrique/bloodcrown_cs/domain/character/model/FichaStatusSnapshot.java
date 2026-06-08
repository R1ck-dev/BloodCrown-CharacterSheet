package br.com.henrique.bloodcrown_cs.domain.character.model;

/**
 * Recorte de leitura do status de uma ficha para o tabuleiro: só os campos que o token exibe
 * (vida atual/máxima, defesa e resistências) + identificação. Carregado por projeção, sem trazer
 * o agregado Character inteiro (evita N+1 das coleções da ficha).
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
