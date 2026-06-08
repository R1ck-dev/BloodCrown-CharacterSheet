package br.com.henrique.bloodcrown_cs.domain.character.model;

/**
 * Resultado de uma rolagem feita na ficha, rebroadcastado para o tabuleiro (card acima do token).
 * kind: "attribute" | "damage". critico = sucesso crítico (atributo) ou golpe pesado (dano).
 */
public record RolagemPayload(String source, int total, String kind, boolean critico) {
}
