package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Snapshot do status da ficha vinculada exibido embaixo do token (barra de vida + selos de
 * defesa/resistências). Vai nulo quando o token não tem ficha ou está com o status escondido.
 */
public record FichaResumoDto(
        String nome,
        Integer currentHealth,
        Integer maxHealth,
        Integer defense,
        Integer physicalRes,
        Integer magicalRes) {
}
