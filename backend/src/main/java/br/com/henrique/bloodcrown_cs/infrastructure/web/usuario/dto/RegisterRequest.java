package br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload de registro. Mantém as mesmas validações do antigo RegisterDTO.
 */
public record RegisterRequest(
    @NotBlank(message = "Username é obrigatório.")
    @Size(min = 3, max = 50, message = "Username deve ter entre 3 e 50 caracteres.")
    String username,

    @NotBlank(message = "Senha é obrigatória.")
    @Size(min = 6, max = 100, message = "Senha deve ter no mínimo 6 caracteres.")
    String password
) {}
