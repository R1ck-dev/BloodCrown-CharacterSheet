package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.mapper;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.MesaJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.TokenJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.TokenTemplateJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.embeddable.GridEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

/**
 * Mapeamento bidirecional do agregado Mesa (raiz + grid + tokens + participantes).
 * Usa EntityManager.getReference para a FK do dono, evitando SELECT extra.
 */
@Component
@RequiredArgsConstructor
public class MesaMapper {

    private final EntityManager entityManager;

    // ---------------------------------------------------------------- domain -> entity

    public MesaJpaEntity toEntity(Mesa domain) {
        MesaJpaEntity entity = new MesaJpaEntity();
        entity.setId(domain.getId());
        entity.setNome(domain.getNome());
        entity.setDono(entityManager.getReference(UserJpaEntity.class, domain.getDonoUserId()));
        entity.setMapaUrl(domain.getMapaUrl());
        entity.setCodigoConvite(domain.getCodigoConvite());
        entity.setGrid(toGridEmbeddable(domain.getGrid()));

        List<TokenJpaEntity> tokens = new ArrayList<>();
        for (Token t : domain.getTokens()) {
            tokens.add(toTokenEntity(t, entity));
        }
        entity.setTokens(tokens);

        List<TokenTemplateJpaEntity> biblioteca = new ArrayList<>();
        for (TokenTemplate tt : domain.getBiblioteca()) {
            biblioteca.add(toTemplateEntity(tt, entity));
        }
        entity.setBiblioteca(biblioteca);

        entity.setParticipantes(new LinkedHashSet<>(domain.getParticipantes()));
        return entity;
    }

    private TokenTemplateJpaEntity toTemplateEntity(TokenTemplate tt, MesaJpaEntity parent) {
        TokenTemplateJpaEntity e = new TokenTemplateJpaEntity();
        e.setId(tt.getId());
        e.setNome(tt.getNome());
        e.setImagemUrl(tt.getImagemUrl());
        e.setMesa(parent);
        return e;
    }

    private TokenJpaEntity toTokenEntity(Token t, MesaJpaEntity parent) {
        TokenJpaEntity e = new TokenJpaEntity();
        e.setId(t.getId());
        e.setNome(t.getNome());
        e.setImagemUrl(t.getImagemUrl());
        e.setCor(t.getCor());
        e.setX(t.getX());
        e.setY(t.getY());
        e.setTamanho(t.getTamanho());
        e.setDonoUserId(t.getDonoUserId());
        e.setMesa(parent);
        return e;
    }

    private GridEmbeddable toGridEmbeddable(Grid g) {
        GridEmbeddable e = new GridEmbeddable();
        Grid grid = g != null ? g : new Grid();
        e.setTamanhoCelula(grid.getTamanhoCelula());
        e.setVisivel(grid.isVisivel());
        e.setCor(grid.getCor());
        return e;
    }

    // ---------------------------------------------------------------- entity -> domain

    public Mesa toDomain(MesaJpaEntity entity) {
        List<Token> tokens = new ArrayList<>();
        for (TokenJpaEntity e : entity.getTokens()) {
            tokens.add(toTokenDomain(e));
        }
        List<TokenTemplate> biblioteca = new ArrayList<>();
        for (TokenTemplateJpaEntity e : entity.getBiblioteca()) {
            biblioteca.add(toTemplateDomain(e));
        }
        return new Mesa(
                entity.getId(),
                entity.getNome(),
                entity.getDono() != null ? entity.getDono().getId() : null,
                entity.getMapaUrl(),
                toGridDomain(entity.getGrid()),
                tokens,
                biblioteca,
                new LinkedHashSet<>(entity.getParticipantes()),
                entity.getCodigoConvite());
    }

    private TokenTemplate toTemplateDomain(TokenTemplateJpaEntity e) {
        TokenTemplate tt = new TokenTemplate();
        tt.setId(e.getId());
        tt.setNome(e.getNome());
        tt.setImagemUrl(e.getImagemUrl());
        return tt;
    }

    private Token toTokenDomain(TokenJpaEntity e) {
        Token t = new Token();
        t.setId(e.getId());
        t.setNome(e.getNome());
        t.setImagemUrl(e.getImagemUrl());
        t.setCor(e.getCor());
        t.setX(e.getX());
        t.setY(e.getY());
        t.setTamanho(e.getTamanho());
        t.setDonoUserId(e.getDonoUserId());
        return t;
    }

    private Grid toGridDomain(GridEmbeddable e) {
        if (e == null) {
            return new Grid();
        }
        return new Grid(e.getTamanhoCelula(), e.isVisivel(), e.getCor());
    }
}
