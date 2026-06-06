package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Cena da mesa: um mapa com seu grid, escala de medição e transformação.
 * mapaLargura/mapaAltura em 0 = tamanho natural da imagem. mapaTravado = mapa fixo como fundo.
 */
public record CenaDto(
        String id,
        String nome,
        int ordem,
        String mapaUrl,
        GridDto grid,
        double escalaValor,
        String escalaUnidade,
        int mapaX,
        int mapaY,
        int mapaLargura,
        int mapaAltura,
        boolean mapaTravado) {
}
