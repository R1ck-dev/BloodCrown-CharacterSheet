package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Vincula uma ficha (Character) a um token; characterId nulo/vazio desvincula. */
public record VincularFichaRequest(String characterId) {}
