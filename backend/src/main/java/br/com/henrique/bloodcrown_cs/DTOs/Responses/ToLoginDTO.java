package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import lombok.Data;

@Data
public class ToLoginDTO {
    private String token;

    public ToLoginDTO(String token) {
        this.token = token;
    }
}
