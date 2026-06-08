package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

public record TokenDto(
        String id,
        String nome,
        String imagemUrl,
        String cor,
        int x,
        int y,
        int tamanho,
        String donoUserId,
        String templateId,
        String cenaId,
        boolean nomeVisivel,
        String characterId,
        boolean statusVisivel,
        FichaResumoDto ficha) {
}
