package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/**
 * Rolagem feita na ficha, enviada para o backend rebroadcastar ao tabuleiro (card acima do token).
 * kind: "attribute" | "damage". critico = sucesso crítico (atributo) ou golpe pesado (dano).
 */
public record RolagemMesaRequest(String source, int total, String kind, boolean critico) {
}
