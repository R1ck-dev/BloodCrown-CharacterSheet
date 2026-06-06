package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
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
    private final List<BibliotecaPasta> pastas;
    private final Set<String> participantes;
    private final String codigoConvite;

    public Mesa(String id, String nome, String donoUserId, String mapaUrl, Grid grid,
                List<Token> tokens, List<TokenTemplate> biblioteca, List<BibliotecaPasta> pastas,
                Set<String> participantes, String codigoConvite) {
        this.id = (id != null && !id.isBlank()) ? id : UUID.randomUUID().toString();
        this.nome = nome;
        this.donoUserId = donoUserId;
        this.mapaUrl = mapaUrl;
        this.grid = grid != null ? grid : new Grid();
        this.tokens = tokens != null ? new ArrayList<>(tokens) : new ArrayList<>();
        this.biblioteca = biblioteca != null ? new ArrayList<>(biblioteca) : new ArrayList<>();
        this.pastas = pastas != null ? new ArrayList<>(pastas) : new ArrayList<>();
        this.participantes = participantes != null ? new LinkedHashSet<>(participantes) : new LinkedHashSet<>();
        this.codigoConvite = codigoConvite;
    }

    /** Cria uma mesa nova: id e código de convite gerados no domínio. */
    public static Mesa criar(String nome, String donoUserId) {
        return new Mesa(null, nome, donoUserId, null, new Grid(), new ArrayList<>(),
                new ArrayList<>(), new ArrayList<>(), new LinkedHashSet<>(), gerarCodigoConvite());
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
        if (template.getPastaId() != null) {
            garantirPastaExiste(template.getPastaId());
        }
        if (template.getBaseId() != null) {
            validarBaseEscolhida(template.getBaseId(), template.getId());
        }
        biblioteca.add(template);
        return template;
    }

    public void removerTemplate(String templateId, String userId) {
        garantirAcesso(userId);
        TokenTemplate template = buscarTemplate(templateId);
        // Remover um base solta suas versões (viram templates base independentes).
        biblioteca.stream()
                .filter(t -> templateId.equals(t.getBaseId()))
                .forEach(t -> t.setBaseId(null));
        biblioteca.remove(template);
    }

    /** Liga/desliga um template existente a um base (versão). baseId nulo = volta a ser base. */
    public void definirBaseTemplate(String templateId, String baseId, String userId) {
        garantirAcesso(userId);
        TokenTemplate template = buscarTemplate(templateId);
        if (baseId == null || baseId.isBlank()) {
            template.setBaseId(null);
            return;
        }
        validarBaseEscolhida(baseId, templateId);
        // Um template que já é base de outras versões não pode virar versão (mantém um nível).
        boolean ehBaseDeOutros = biblioteca.stream().anyMatch(t -> templateId.equals(t.getBaseId()));
        if (ehBaseDeOutros) {
            throw new BadRequestException("Este token já é base de outras versões.");
        }
        template.setBaseId(baseId);
    }

    private TokenTemplate buscarTemplate(String templateId) {
        return biblioteca.stream()
                .filter(t -> t.getId().equals(templateId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Template nao encontrado nesta mesa."));
    }

    private void validarBaseEscolhida(String baseId, String templateId) {
        if (baseId.equals(templateId)) {
            throw new BadRequestException("Um token não pode ser versão de si mesmo.");
        }
        TokenTemplate base = biblioteca.stream()
                .filter(t -> t.getId().equals(baseId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Token base não encontrado nesta mesa."));
        if (base.getBaseId() != null) {
            throw new BadRequestException("O token base não pode ser ele mesmo uma versão.");
        }
    }

    // ----------------------------------------------------------------- pastas da biblioteca

    public BibliotecaPasta adicionarPasta(BibliotecaPasta pasta, String userId) {
        garantirAcesso(userId);
        pastas.add(pasta);
        return pasta;
    }

    /** Remove a pasta; os templates que estavam nela voltam para a raiz. */
    public void removerPasta(String pastaId, String userId) {
        garantirAcesso(userId);
        BibliotecaPasta pasta = pastas.stream()
                .filter(p -> p.getId().equals(pastaId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Pasta nao encontrada nesta mesa."));
        biblioteca.stream()
                .filter(t -> pastaId.equals(t.getPastaId()))
                .forEach(t -> t.setPastaId(null));
        pastas.remove(pasta);
    }

    /** Move um template para uma pasta (pastaId nulo = raiz). */
    public void moverTemplateParaPasta(String templateId, String pastaId, String userId) {
        garantirAcesso(userId);
        TokenTemplate template = buscarTemplate(templateId);
        if (pastaId != null && !pastaId.isBlank()) {
            garantirPastaExiste(pastaId);
            template.setPastaId(pastaId);
        } else {
            template.setPastaId(null);
        }
    }

    private void garantirPastaExiste(String pastaId) {
        boolean existe = pastas.stream().anyMatch(p -> p.getId().equals(pastaId));
        if (!existe) {
            throw new NotFoundException("Pasta nao encontrada nesta mesa.");
        }
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

    /**
     * Troca a versão de um token colocado pela arte/nome de outro template da biblioteca.
     * O template alvo precisa pertencer ao mesmo grupo de versões do template atual do token.
     * Mantém posição, tamanho e dono. Colaborativo.
     */
    public Token trocarVersaoToken(String tokenId, String templateId, String userId) {
        garantirAcesso(userId);
        Token token = buscarToken(tokenId);
        TokenTemplate alvo = buscarTemplate(templateId);
        if (token.getTemplateId() != null) {
            TokenTemplate atual = biblioteca.stream()
                    .filter(t -> t.getId().equals(token.getTemplateId()))
                    .findFirst()
                    .orElse(null);
            if (atual != null && !atual.grupoId().equals(alvo.grupoId())) {
                throw new BadRequestException("Esse token não é uma versão deste.");
            }
        }
        token.setNome(alvo.getNome());
        token.setImagemUrl(alvo.getImagemUrl());
        token.setTemplateId(alvo.getId());
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
