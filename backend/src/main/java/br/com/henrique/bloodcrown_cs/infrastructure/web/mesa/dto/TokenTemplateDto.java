package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Item da biblioteca (sem posição). tipo = TOKEN|MAPA|DOCUMENTO; baseId = versão de outro; pastaId = pasta. */
public record TokenTemplateDto(String id, String nome, String imagemUrl, String tipo, String baseId, String pastaId) {}
