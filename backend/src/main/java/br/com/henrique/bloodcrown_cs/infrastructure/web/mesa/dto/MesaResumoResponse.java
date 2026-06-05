package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Item da lista de mesas (sem tokens). */
public record MesaResumoResponse(String id, String nome, boolean souDono, String codigoConvite) {}
