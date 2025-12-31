package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import lombok.Data;

/**
 * Encapsula a resposta de uma solicitação de login bem-sucedida.
 * Transporta o token JWT que deve ser utilizado para autenticar requisições subsequentes.
 */
@Data
public class ToLoginDTO {
    private String token;

    /**
     * Inicializa o DTO com o token de autenticação gerado.
     * @param token O token JWT assinado.
     */
    public ToLoginDTO(String token) {
        this.token = token;
    }
}