package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

import jakarta.validation.constraints.NotBlank;

public record CriarMesaRequest(@NotBlank(message = "Nome da mesa nao pode ser vazio.") String nome) {}
