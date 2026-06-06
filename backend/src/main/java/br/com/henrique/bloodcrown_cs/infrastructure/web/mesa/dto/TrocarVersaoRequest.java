package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Troca a versão de um token colocado pelo template alvo (do mesmo grupo de versões). */
public record TrocarVersaoRequest(String templateId) {}
