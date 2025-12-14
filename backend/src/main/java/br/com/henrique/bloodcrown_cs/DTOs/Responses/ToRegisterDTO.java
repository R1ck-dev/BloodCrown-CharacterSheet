package br.com.henrique.bloodcrown_cs.DTOs.Responses;

import lombok.Data;

@Data
public class ToRegisterDTO {
    private String id;
    private String username;
    
    public ToRegisterDTO() {

    }
}
