package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

import java.util.List;

/**
 * Estado completo da mesa. souDono indica se o usuário da requisição é o mestre. As cenas trazem
 * cada uma seu mapa/grid/escala; cenaAtivaId é a cena exibida. Os tokens trazem a cenaId a que
 * pertencem (o front filtra pela cena ativa).
 */
public record MesaResponse(
        String id,
        String nome,
        String donoUserId,
        boolean souDono,
        List<CenaDto> cenas,
        String cenaAtivaId,
        List<TokenDto> tokens,
        List<TokenTemplateDto> biblioteca,
        List<PastaDto> pastas,
        List<String> participantes,
        String codigoConvite) {
}
