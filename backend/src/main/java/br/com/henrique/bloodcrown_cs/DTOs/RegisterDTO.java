package br.com.henrique.bloodcrown_cs.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Objeto de transferência de dados utilizado no processo de criação de uma nova conta de usuário.
 * Transporta as credenciais iniciais para serem validadas e persistidas.
 * * @param username Nome de usuário desejado.
 * @param password Senha em texto plano (será criptografada pelo serviço).
 */
public record RegisterDTO(
    @NotBlank(message = "Username é obrigatório.")
    @Size(min = 3, max = 50, message = "Username deve ter entre 3 e 50 caracteres.")
    String username,

    @NotBlank(message = "Senha é obrigatória.")
    @Size(min = 6, max = 100, message = "Senha deve ter no mínimo 6 caracteres.")
    String password
) {

}
