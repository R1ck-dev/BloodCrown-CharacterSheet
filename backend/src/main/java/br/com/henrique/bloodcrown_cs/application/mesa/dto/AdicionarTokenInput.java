package br.com.henrique.bloodcrown_cs.application.mesa.dto;

/** Dados para criar um token no mapa. imagemUrl/cor opcionais (cor é fallback visual). */
public record AdicionarTokenInput(
        String nome,
        String imagemUrl,
        String cor,
        int x,
        int y,
        int tamanho) {
}
