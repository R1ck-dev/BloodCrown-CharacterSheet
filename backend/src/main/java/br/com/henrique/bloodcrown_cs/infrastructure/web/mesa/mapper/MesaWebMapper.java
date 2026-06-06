package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.GridDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResumoResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenTemplateDto;

/** Mapeia o domínio Mesa para os DTOs web. souDono é calculado a partir do userId da requisição. */
@Component
public class MesaWebMapper {

    public MesaResponse toResponse(Mesa mesa, String userId) {
        List<TokenDto> tokens = mesa.getTokens().stream().map(this::toTokenDto).toList();
        List<TokenTemplateDto> biblioteca = mesa.getBiblioteca().stream().map(this::toTemplateDto).toList();
        return new MesaResponse(
                mesa.getId(),
                mesa.getNome(),
                mesa.getDonoUserId(),
                mesa.isDono(userId),
                mesa.getMapaUrl(),
                toGridDto(mesa.getGrid()),
                tokens,
                biblioteca,
                List.copyOf(mesa.getParticipantes()),
                mesa.getCodigoConvite());
    }

    public TokenTemplateDto toTemplateDto(TokenTemplate t) {
        return new TokenTemplateDto(t.getId(), t.getNome(), t.getImagemUrl());
    }

    public MesaResumoResponse toResumo(Mesa mesa, String userId) {
        return new MesaResumoResponse(mesa.getId(), mesa.getNome(), mesa.isDono(userId), mesa.getCodigoConvite());
    }

    public TokenDto toTokenDto(Token t) {
        return new TokenDto(t.getId(), t.getNome(), t.getImagemUrl(), t.getCor(),
                t.getX(), t.getY(), t.getTamanho(), t.getDonoUserId());
    }

    private GridDto toGridDto(Grid g) {
        Grid grid = g != null ? g : new Grid();
        return new GridDto(grid.getTamanhoCelula(), grid.isVisivel(), grid.getCor());
    }
}
