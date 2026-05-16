package br.com.henrique.bloodcrown_cs.DTOs;

import jakarta.validation.constraints.NotBlank;

/**
 * Objeto simples utilizado para transportar as credenciais de acesso durante a tentativa de autenticação.
 * * @param username O nome de usuário ou identificador.
 * @param password A senha em texto plano (será processada pelo gerenciador de autenticação).
 */
public record LoginDTO(
    @NotBlank(message = "Username é obrigatório.") String username,
    @NotBlank(message = "Senha é obrigatória.") String password
) {

}
