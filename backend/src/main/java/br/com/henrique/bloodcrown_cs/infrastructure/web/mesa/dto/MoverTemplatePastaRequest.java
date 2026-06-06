package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Move um template para uma pasta; pastaId nulo = raiz da biblioteca. */
public record MoverTemplatePastaRequest(String pastaId) {}
