package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import lombok.Data;

/**
 * Representa os dados retornados ao cliente após o registro bem-sucedido de um usuário.
 * Oculta informações sensíveis (como a senha) e expõe apenas identificadores públicos.
 */
@Data
public class ToRegisterDTO {
    private String id;
    private String username;
    
    /**
     * Construtor padrão necessário para serialização/desserialização.
     */
    public ToRegisterDTO() {

    }
}