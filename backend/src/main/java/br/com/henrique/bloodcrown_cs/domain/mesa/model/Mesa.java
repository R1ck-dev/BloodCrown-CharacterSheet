package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import br.com.henrique.bloodcrown_cs.domain.shared.exception.ForbiddenException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.Getter;

/**
 * Raiz do agregado Mesa (tabletop compartilhado). Dona do mapa, do grid, dos tokens, da
 * biblioteca de templates e da lista de participantes. Toda regra de acesso/posse mora aqui
 * como método de domínio; a use case só orquestra e persiste. IDs gerados no domínio (UUID).
 */
@Getter
public class Mesa {

    private static final int TAMANHO_MIN = 10;
    private static final int TAMANHO_MAX = 1000;

    private final String id;
    private String nome;
    private final String donoUserId;
    private String mapaUrl;
    private Grid grid;
    private final List<Token> tokens;
    private final List<TokenTemplate> biblioteca;
    private final Set<String> participantes;
    private final String codigoConvite;

    public Mesa(String id, String nome, String donoUserId, String mapaUrl, Grid grid,
                List<Token> tokens, List<TokenTemplate> biblioteca, Set<String> participantes,
                String codigoConvite) {
        this.id = (id != null && !id.isBlank()) ? id : UUID.randomUUID().toString();
        this.nome = nome;
        this.donoUserId = donoUserId;
        this.mapaUrl = mapaUrl;
        this.grid = grid != null ? grid : new Grid();
        this.tokens = tokens != null ? new ArrayList<>(tokens) : new ArrayList<>();
        this.biblioteca = biblioteca != null ? new ArrayList<>(biblioteca) : new ArrayList<>();
        this.participantes = participantes != null ? new LinkedHashSet<>(participantes) : new LinkedHashSet<>();
        this.codigoConvite = codigoConvite;
    }

    /** Cria uma mesa nova: id e código de convite gerados no domínio. */
    public static Mesa criar(String nome, String donoUserId) {
        return new Mesa(null, nome, donoUserId, null, new Grid(), new ArrayList<>(),
                new ArrayList<>(), new LinkedHashSet<>(), gerarCodigoConvite());
    }

    private static String gerarCodigoConvite() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    // ----------------------------------------------------------------- acesso / posse

    public boolean isDono(String userId) {
        return donoUserId != null && donoUserId.equals(userId);
    }

    public boolean podeAcessar(String userId) {
        return isDono(userId) || participantes.contains(userId);
    }

    public void garantirAcesso(String userId) {
        if (!podeAcessar(userId)) {
            throw new ForbiddenException("Voce nao participa desta mesa.");
        }
    }

    public void garantirDono(String userId) {
        if (!isDono(userId)) {
            throw new ForbiddenException("Apenas o mestre da mesa pode fazer isso.");
        }
    }

    /** Adiciona um participante (idempotente; o dono não entra na lista). */
    public void entrar(String userId) {
        if (userId != null && !isDono(userId)) {
            participantes.add(userId);
        }
    }

    // ----------------------------------------------------------------- mapa / grid

    public void trocarMapa(String url, String userId) {
        garantirDono(userId);
        this.mapaUrl = url;
    }

    public void configurarGrid(Grid grid, String userId) {
        garantirDono(userId);
        if (grid != null) {
            this.grid = grid;
        }
    }

    public void renomear(String nome, String userId) {
        garantirDono(userId);
        if (nome != null && !nome.isBlank()) {
            this.nome = nome;
        }
    }

    // ----------------------------------------------------------------- biblioteca (templates)

    /** Qualquer participante pode pré-carregar tokens na biblioteca (colaborativo). */
    public TokenTemplate adicionarTemplate(TokenTemplate template, String userId) {
        garantirAcesso(userId);
        biblioteca.add(template);
        return template;
    }

    public void removerTemplate(String templateId, String userId) {
        garantirAcesso(userId);
        TokenTemplate template = biblioteca.stream()
                .filter(t -> t.getId().equals(templateId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Template nao encontrado nesta mesa."));
        biblioteca.remove(template);
    }

    // ----------------------------------------------------------------- tokens

    /** Qualquer participante pode adicionar tokens (colaborativo). */
    public Token adicionarToken(Token token, String userId) {
        garantirAcesso(userId);
        tokens.add(token);
        return token;
    }

    /** Move um token. Colaborativo: qualquer participante pode mover (mesa de confiança). */
    public Token moverToken(String tokenId, int x, int y, String userId) {
        garantirAcesso(userId);
        Token token = buscarToken(tokenId);
        token.setX(x);
        token.setY(y);
        return token;
    }

    /** Redimensiona um token (tamanho em px, com limites). Colaborativo. */
    public Token redimensionarToken(String tokenId, int tamanho, String userId) {
        garantirAcesso(userId);
        Token token = buscarToken(tokenId);
        token.setTamanho(Math.max(TAMANHO_MIN, Math.min(TAMANHO_MAX, tamanho)));
        return token;
    }

    /** Remove um token. Permitido ao dono da mesa ou ao dono do token. */
    public void removerToken(String tokenId, String userId) {
        Token token = buscarToken(tokenId);
        garantirPodeMexer(token, userId);
        tokens.remove(token);
    }

    private Token buscarToken(String tokenId) {
        return tokens.stream()
                .filter(t -> t.getId().equals(tokenId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Token nao encontrado nesta mesa."));
    }

    private void garantirPodeMexer(Token token, String userId) {
        boolean donoDoToken = token.getDonoUserId() != null && token.getDonoUserId().equals(userId);
        if (!isDono(userId) && !donoDoToken) {
            throw new ForbiddenException("Voce nao pode mexer neste token.");
        }
    }
}
