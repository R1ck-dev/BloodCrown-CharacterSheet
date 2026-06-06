package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.mapper;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.BibliotecaPasta;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Cena;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TipoTemplate;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.BibliotecaPastaJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.CenaJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.MesaJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.TokenJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.TokenTemplateJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.embeddable.GridEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

/**
 * Mapeamento bidirecional do agregado Mesa (raiz + cenas + tokens + biblioteca + participantes).
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
        entity.setCenaAtivaId(domain.getCenaAtivaId());
        entity.setCodigoConvite(domain.getCodigoConvite());

        List<CenaJpaEntity> cenas = new ArrayList<>();
        for (Cena c : domain.getCenas()) {
            cenas.add(toCenaEntity(c, entity));
        }
        entity.setCenas(cenas);

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

        List<BibliotecaPastaJpaEntity> pastas = new ArrayList<>();
        for (BibliotecaPasta p : domain.getPastas()) {
            pastas.add(toPastaEntity(p, entity));
        }
        entity.setPastas(pastas);

        entity.setParticipantes(new LinkedHashSet<>(domain.getParticipantes()));
        return entity;
    }

    private CenaJpaEntity toCenaEntity(Cena c, MesaJpaEntity parent) {
        CenaJpaEntity e = new CenaJpaEntity();
        e.setId(c.getId());
        e.setMesa(parent);
        e.setNome(c.getNome());
        e.setOrdem(c.getOrdem());
        e.setMapaUrl(c.getMapaUrl());
        e.setGrid(toGridEmbeddable(c.getGrid()));
        e.setEscalaValor(c.getEscalaValor());
        e.setEscalaUnidade(c.getEscalaUnidade());
        e.setMapaX(c.getMapaX());
        e.setMapaY(c.getMapaY());
        e.setMapaLargura(c.getMapaLargura());
        e.setMapaAltura(c.getMapaAltura());
        e.setMapaTravado(c.isMapaTravado());
        return e;
    }

    private TokenTemplateJpaEntity toTemplateEntity(TokenTemplate tt, MesaJpaEntity parent) {
        TokenTemplateJpaEntity e = new TokenTemplateJpaEntity();
        e.setId(tt.getId());
        e.setNome(tt.getNome());
        e.setImagemUrl(tt.getImagemUrl());
        e.setTipo((tt.getTipo() != null ? tt.getTipo() : TipoTemplate.TOKEN).name());
        e.setBaseId(tt.getBaseId());
        e.setPastaId(tt.getPastaId());
        e.setMesa(parent);
        return e;
    }

    private BibliotecaPastaJpaEntity toPastaEntity(BibliotecaPasta p, MesaJpaEntity parent) {
        BibliotecaPastaJpaEntity e = new BibliotecaPastaJpaEntity();
        e.setId(p.getId());
        e.setNome(p.getNome());
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
        e.setTemplateId(t.getTemplateId());
        e.setCenaId(t.getCenaId());
        e.setNomeVisivel(t.isNomeVisivel());
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
        List<Cena> cenas = new ArrayList<>();
        for (CenaJpaEntity e : entity.getCenas()) {
            cenas.add(toCenaDomain(e));
        }
        List<Token> tokens = new ArrayList<>();
        for (TokenJpaEntity e : entity.getTokens()) {
            tokens.add(toTokenDomain(e));
        }
        List<TokenTemplate> biblioteca = new ArrayList<>();
        for (TokenTemplateJpaEntity e : entity.getBiblioteca()) {
            biblioteca.add(toTemplateDomain(e));
        }
        List<BibliotecaPasta> pastas = new ArrayList<>();
        for (BibliotecaPastaJpaEntity e : entity.getPastas()) {
            pastas.add(toPastaDomain(e));
        }
        return new Mesa(
                entity.getId(),
                entity.getNome(),
                entity.getDono() != null ? entity.getDono().getId() : null,
                cenas,
                entity.getCenaAtivaId(),
                tokens,
                biblioteca,
                pastas,
                new LinkedHashSet<>(entity.getParticipantes()),
                entity.getCodigoConvite());
    }

    private Cena toCenaDomain(CenaJpaEntity e) {
        Cena c = new Cena();
        c.setId(e.getId());
        c.setNome(e.getNome());
        c.setOrdem(e.getOrdem());
        c.setMapaUrl(e.getMapaUrl());
        c.setGrid(toGridDomain(e.getGrid()));
        c.setEscalaValor(e.getEscalaValor());
        c.setEscalaUnidade(e.getEscalaUnidade());
        c.setMapaX(e.getMapaX());
        c.setMapaY(e.getMapaY());
        c.setMapaLargura(e.getMapaLargura());
        c.setMapaAltura(e.getMapaAltura());
        c.setMapaTravado(e.isMapaTravado());
        return c;
    }

    private TokenTemplate toTemplateDomain(TokenTemplateJpaEntity e) {
        TokenTemplate tt = new TokenTemplate();
        tt.setId(e.getId());
        tt.setNome(e.getNome());
        tt.setImagemUrl(e.getImagemUrl());
        tt.setTipo(TipoTemplate.from(e.getTipo()));
        tt.setBaseId(e.getBaseId());
        tt.setPastaId(e.getPastaId());
        return tt;
    }

    private BibliotecaPasta toPastaDomain(BibliotecaPastaJpaEntity e) {
        BibliotecaPasta p = new BibliotecaPasta();
        p.setId(e.getId());
        p.setNome(e.getNome());
        return p;
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
        t.setTemplateId(e.getTemplateId());
        t.setCenaId(e.getCenaId());
        t.setNomeVisivel(e.isNomeVisivel());
        return t;
    }

    private Grid toGridDomain(GridEmbeddable e) {
        if (e == null) {
            return new Grid();
        }
        return new Grid(e.getTamanhoCelula(), e.isVisivel(), e.getCor());
    }
}
