package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Molde de token na biblioteca (sem posição). baseId = é versão de outro; pastaId = pasta. */
public record TokenTemplateDto(String id, String nome, String imagemUrl, String baseId, String pastaId) {}
