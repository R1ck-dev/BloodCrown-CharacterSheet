package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Objeto de transferência de dados utilizado no processo de criação de uma nova conta de usuário.
 * Transporta as credenciais iniciais para serem validadas e persistidas.
 * * @param username Nome de usuário desejado.
 * @param password Senha em texto plano (será criptografada pelo serviço).
 */
public record RegisterDTO(String username, String password) {
    
}