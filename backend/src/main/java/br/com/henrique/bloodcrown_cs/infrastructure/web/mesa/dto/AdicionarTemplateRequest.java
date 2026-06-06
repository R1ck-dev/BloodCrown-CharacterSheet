package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** tipo: TOKEN|MAPA|DOCUMENTO (default TOKEN). baseId opcional (só token): versão de um base. pastaId opcional. */
public record AdicionarTemplateRequest(String nome, String imagemUrl, String tipo, String baseId, String pastaId) {}
