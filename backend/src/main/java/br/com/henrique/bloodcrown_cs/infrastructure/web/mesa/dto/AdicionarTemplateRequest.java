package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** baseId opcional: cria o template já como versão de um base. pastaId opcional: organização. */
public record AdicionarTemplateRequest(String nome, String imagemUrl, String baseId, String pastaId) {}
