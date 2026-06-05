package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

import jakarta.validation.constraints.NotBlank;

public record EntrarMesaRequest(@NotBlank(message = "Informe o codigo da mesa.") String codigo) {}
