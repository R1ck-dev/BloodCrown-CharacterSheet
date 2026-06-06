package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Posição/tamanho do mapa na cena + trava (fundo fixo). largura/altura em 0 = tamanho natural. */
public record TransformarMapaRequest(int x, int y, int largura, int altura, boolean travado) {}
