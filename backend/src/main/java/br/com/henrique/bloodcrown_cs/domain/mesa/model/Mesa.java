package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.ForbiddenException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.Getter;

/**
 * Raiz do agregado Mesa (tabletop compartilhado). Dona das cenas (cada uma com seu mapa, grid,
 * escala e transformação), dos tokens, da biblioteca de templates e da lista de participantes.
 * Cada token guarda a cena a que pertence; só aparece quando aquela é a cena ativa. Toda regra
 * de acesso/posse mora aqui como método de domínio; a use case só orquestra e persiste. IDs
 * gerados no domínio (UUID).
 */
@Getter
public class Mesa {

    private static final int TAMANHO_MIN = 10;
    private static final int TAMANHO_MAX = 1000;

    private final String id;
    private String nome;
    private final String donoUserId;
    private final List<Cena> cenas;
    private String cenaAtivaId;
    private final List<Token> tokens;
    private final List<TokenTemplate> biblioteca;
    private final List<BibliotecaPasta> pastas;
    private final Set<String> participantes;
    private final String codigoConvite;

    public Mesa(String id, String nome, String donoUserId, List<Cena> cenas, String cenaAtivaId,
                List<Token> tokens, List<TokenTemplate> biblioteca, List<BibliotecaPasta> pastas,
                Set<String> participantes, String codigoConvite) {
        this.id = (id != null && !id.isBlank()) ? id : UUID.randomUUID().toString();
        this.nome = nome;
        this.donoUserId = donoUserId;
        this.cenas = cenas != null ? new ArrayList<>(cenas) : new ArrayList<>();
        // Autocorreção: se a cena ativa sumiu/veio inválida (ex.: dado legado), aponta pra 1ª cena.
        this.cenaAtivaId = normalizarCenaAtiva(cenaAtivaId);
        this.tokens = tokens != null ? new ArrayList<>(tokens) : new ArrayList<>();
        this.biblioteca = biblioteca != null ? new ArrayList<>(biblioteca) : new ArrayList<>();
        this.pastas = pastas != null ? new ArrayList<>(pastas) : new ArrayList<>();
        this.participantes = participantes != null ? new LinkedHashSet<>(participantes) : new LinkedHashSet<>();
        this.codigoConvite = codigoConvite;
    }

    /** Cria uma mesa nova com uma cena inicial; id e código de convite gerados no domínio. */
    public static Mesa criar(String nome, String donoUserId) {
        Cena inicial = Cena.criar("Cena 1", 0);
        List<Cena> cenas = new ArrayList<>();
        cenas.add(inicial);
        return new Mesa(null, nome, donoUserId, cenas, inicial.getId(), new ArrayList<>(),
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

    public void renomear(String nome, String userId) {
        garantirDono(userId);
        if (nome != null && !nome.isBlank()) {
            this.nome = nome;
        }
    }

    // ----------------------------------------------------------------- cenas

    /** Cria uma cena nova (vazia) e a deixa ativa. Só o mestre. */
    public Cena adicionarCena(String nome, String userId) {
        garantirDono(userId);
        int proximaOrdem = cenas.stream().mapToInt(Cena::getOrdem).max().orElse(-1) + 1;
        Cena cena = Cena.criar(nome, proximaOrdem);
        cenas.add(cena);
        this.cenaAtivaId = cena.getId();
        return cena;
    }

    /** Remove uma cena (e os tokens dela). Não pode remover a última. Só o mestre. */
    public void removerCena(String cenaId, String userId) {
        garantirDono(userId);
        Cena cena = buscarCena(cenaId);
        if (cenas.size() <= 1) {
            throw new BadRequestException("A mesa precisa de pelo menos uma cena.");
        }
        tokens.removeIf(t -> cenaId.equals(t.getCenaId()));
        cenas.remove(cena);
        if (cenaId.equals(cenaAtivaId)) {
            this.cenaAtivaId = primeiraCenaId();
        }
    }

    /** Id da cena de menor ordem (1ª aba); null se não houver cenas. */
    private String primeiraCenaId() {
        return cenas.stream().min(Comparator.comparingInt(Cena::getOrdem)).map(Cena::getId).orElse(null);
    }

    private String normalizarCenaAtiva(String cenaAtivaId) {
        if (cenas.isEmpty()) {
            return cenaAtivaId;
        }
        boolean valida = cenaAtivaId != null && cenas.stream().anyMatch(c -> c.getId().equals(cenaAtivaId));
        return valida ? cenaAtivaId : primeiraCenaId();
    }

    public void renomearCena(String cenaId, String nome, String userId) {
        garantirDono(userId);
        Cena cena = buscarCena(cenaId);
        if (nome != null && !nome.isBlank()) {
            cena.setNome(nome);
        }
    }

    /** Troca a cena ativa exibida no tabuleiro. Só o mestre. */
    public void ativarCena(String cenaId, String userId) {
        garantirDono(userId);
        buscarCena(cenaId);
        this.cenaAtivaId = cenaId;
    }

    // ----------------------------------------------------------------- mapa / grid / escala (por cena)

    public void trocarMapa(String cenaId, String url, String userId) {
        garantirDono(userId);
        Cena cena = buscarCena(cenaId);
        cena.setMapaUrl(url);
    }

    public void configurarGrid(String cenaId, Grid grid, double escalaValor, String escalaUnidade, String userId) {
        garantirDono(userId);
        Cena cena = buscarCena(cenaId);
        if (grid != null) {
            cena.setGrid(grid);
        }
        if (escalaValor > 0) {
            cena.setEscalaValor(escalaValor);
        }
        if (escalaUnidade != null && !escalaUnidade.isBlank()) {
            cena.setEscalaUnidade(escalaUnidade);
        }
    }

    /** Move/redimensiona o mapa da cena e define se ele fica travado como fundo. Só o mestre. */
    public void transformarMapa(String cenaId, int x, int y, int largura, int altura,
                                boolean travado, String userId) {
        garantirDono(userId);
        Cena cena = buscarCena(cenaId);
        cena.setMapaX(x);
        cena.setMapaY(y);
        cena.setMapaLargura(Math.max(0, largura));
        cena.setMapaAltura(Math.max(0, altura));
        cena.setMapaTravado(travado);
    }

    private Cena buscarCena(String cenaId) {
        return cenas.stream()
                .filter(c -> c.getId().equals(cenaId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cena nao encontrada nesta mesa."));
    }

    private void garantirCenaExiste(String cenaId) {
        boolean existe = cenas.stream().anyMatch(c -> c.getId().equals(cenaId));
        if (!existe) {
            throw new NotFoundException("Cena nao encontrada nesta mesa.");
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

    /** Qualquer participante pode adicionar tokens a uma cena (colaborativo). */
    public Token adicionarToken(String cenaId, Token token, String userId) {
        garantirAcesso(userId);
        garantirCenaExiste(cenaId);
        token.setCenaId(cenaId);
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

    /** Mostra/esconde o nome embaixo do token. Colaborativo. */
    public Token definirNomeVisivel(String tokenId, boolean visivel, String userId) {
        garantirAcesso(userId);
        Token token = buscarToken(tokenId);
        token.setNomeVisivel(visivel);
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
