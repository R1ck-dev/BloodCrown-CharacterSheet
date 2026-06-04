package br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Credenciais de login. Mantém as validações do antigo LoginDTO.
 */
public record LoginRequest(
    @NotBlank(message = "Username é obrigatório.") String username,
    @NotBlank(message = "Senha é obrigatória.") String password
) {}
