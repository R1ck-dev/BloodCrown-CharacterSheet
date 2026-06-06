package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Liga um template a um base (vira versão); baseId nulo = volta a ser base independente. */
public record DefinirBaseRequest(String baseId) {}
