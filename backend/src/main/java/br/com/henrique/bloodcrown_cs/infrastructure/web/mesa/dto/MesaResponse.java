package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

import java.util.List;

/** Estado completo da mesa. souDono indica se o usuário da requisição é o mestre. */
public record MesaResponse(
        String id,
        String nome,
        String donoUserId,
        boolean souDono,
        String mapaUrl,
        GridDto grid,
        List<TokenDto> tokens,
        List<String> participantes,
        String codigoConvite) {
}
