package br.com.henrique.bloodcrown_cs.application.mesa.dto;

/**
 * Dados para criar um token no mapa. imagemUrl/cor opcionais (cor é fallback visual).
 * templateId opcional: vincula o token ao molde/versão da biblioteca de onde veio (troca rápida).
 */
public record AdicionarTokenInput(
        String nome,
        String imagemUrl,
        String cor,
        int x,
        int y,
        int tamanho,
        String templateId) {
}
