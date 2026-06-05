package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** mapaUrl pode ser null (remove o mapa) ou qualquer URL de imagem (fallback local sem R2). */
public record TrocarMapaRequest(String mapaUrl) {}
