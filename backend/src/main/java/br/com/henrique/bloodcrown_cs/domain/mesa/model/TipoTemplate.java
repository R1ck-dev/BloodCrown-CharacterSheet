package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;

/**
 * Tipo de um item da biblioteca da mesa: token de criatura/PJ, mapa de cena ou documento
 * (handout/lore). O tipo define como o item é usado no tabuleiro (colocar token, aplicar como
 * mapa da cena, ou colocar como imagem) e separa a biblioteca em seções/filtros.
 */
public enum TipoTemplate {
    TOKEN,
    MAPA,
    DOCUMENTO;

    /** Converte a String do request/persistência; null/blank → TOKEN; valor inválido → 400. */
    public static TipoTemplate from(String valor) {
        if (valor == null || valor.isBlank()) {
            return TOKEN;
        }
        try {
            return TipoTemplate.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Tipo de item da biblioteca invalido: " + valor);
        }
    }
}
