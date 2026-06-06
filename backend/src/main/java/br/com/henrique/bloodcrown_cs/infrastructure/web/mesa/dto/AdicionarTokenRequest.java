package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

public record AdicionarTokenRequest(
        String nome,
        String imagemUrl,
        String cor,
        int x,
        int y,
        int tamanho,
        String templateId,
        String cenaId) {
}
