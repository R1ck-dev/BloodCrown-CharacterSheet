package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.BibliotecaPasta;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Cena;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.CenaDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.GridDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResumoResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.PastaDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenTemplateDto;

/** Mapeia o domínio Mesa para os DTOs web. souDono é calculado a partir do userId da requisição. */
@Component
public class MesaWebMapper {

    public MesaResponse toResponse(Mesa mesa, String userId) {
        List<CenaDto> cenas = mesa.getCenas().stream().map(this::toCenaDto).toList();
        List<TokenDto> tokens = mesa.getTokens().stream().map(this::toTokenDto).toList();
        List<TokenTemplateDto> biblioteca = mesa.getBiblioteca().stream().map(this::toTemplateDto).toList();
        List<PastaDto> pastas = mesa.getPastas().stream().map(this::toPastaDto).toList();
        return new MesaResponse(
                mesa.getId(),
                mesa.getNome(),
                mesa.getDonoUserId(),
                mesa.isDono(userId),
                cenas,
                mesa.getCenaAtivaId(),
                tokens,
                biblioteca,
                pastas,
                List.copyOf(mesa.getParticipantes()),
                mesa.getCodigoConvite());
    }

    public CenaDto toCenaDto(Cena c) {
        return new CenaDto(
                c.getId(),
                c.getNome(),
                c.getOrdem(),
                c.getMapaUrl(),
                toGridDto(c.getGrid()),
                c.getEscalaValor(),
                c.getEscalaUnidade(),
                c.getMapaX(),
                c.getMapaY(),
                c.getMapaLargura(),
                c.getMapaAltura(),
                c.isMapaTravado());
    }

    public TokenTemplateDto toTemplateDto(TokenTemplate t) {
        return new TokenTemplateDto(t.getId(), t.getNome(), t.getImagemUrl(), t.getBaseId(), t.getPastaId());
    }

    public PastaDto toPastaDto(BibliotecaPasta p) {
        return new PastaDto(p.getId(), p.getNome());
    }

    public MesaResumoResponse toResumo(Mesa mesa, String userId) {
        return new MesaResumoResponse(mesa.getId(), mesa.getNome(), mesa.isDono(userId), mesa.getCodigoConvite());
    }

    public TokenDto toTokenDto(Token t) {
        return new TokenDto(t.getId(), t.getNome(), t.getImagemUrl(), t.getCor(),
                t.getX(), t.getY(), t.getTamanho(), t.getDonoUserId(), t.getTemplateId(),
                t.getCenaId(), t.isNomeVisivel());
    }

    private GridDto toGridDto(Grid g) {
        Grid grid = g != null ? g : new Grid();
        return new GridDto(grid.getTamanhoCelula(), grid.isVisivel(), grid.getCor());
    }
}
