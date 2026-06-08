package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Token (peça) posicionado no mapa da mesa. Sub-entidade do agregado {@link Mesa}.
 * Tem imagem (R2) ou, na ausência dela, uma cor de fallback. Posição em pixels do mapa.
 * Pode estar vinculado a uma ficha ({@code characterId}); nesse caso o tabuleiro lê o snapshot de
 * status da ficha (vida/defesa/resistências) para desenhar a barra/selos embaixo do token.
 */
@Getter
@Setter
public class Token {

    private String id;
    private String nome;
    private String imagemUrl;
    private String cor;
    private int x;
    private int y;
    private int tamanho;
    /** Usuário que controla este token (o dono da mesa também pode movê-lo). */
    private String donoUserId;
    /**
     * Template da biblioteca que este token representa atualmente; nulo = token avulso (criado
     * antes das versões ou fora da biblioteca). Permite a troca rápida de versão no tabuleiro:
     * o grupo de versões é resolvido a partir deste id contra a biblioteca da mesa.
     */
    private String templateId;
    /** Cena a que este token pertence; só aparece no tabuleiro quando essa é a cena ativa. */
    private String cenaId;
    /** Mostra o nome do token embaixo dele no tabuleiro (padrão: visível). */
    private boolean nomeVisivel = true;
    /** Ficha (Character) vinculada a este token; nulo = token sem ficha. String solta, não FK. */
    private String characterId;
    /** Mostra a barra/selos de status da ficha embaixo do token (padrão: visível). */
    private boolean statusVisivel = true;

    public Token() {
    }

    /** Cria um token novo com id gerado no domínio, ligado a uma cena. */
    public static Token criar(String nome, String imagemUrl, String cor, int x, int y,
                              int tamanho, String donoUserId, String templateId, String cenaId) {
        Token t = new Token();
        t.id = UUID.randomUUID().toString();
        t.nome = nome;
        t.imagemUrl = imagemUrl;
        t.cor = (cor != null && !cor.isBlank()) ? cor : "#8b1e2d";
        t.x = x;
        t.y = y;
        t.tamanho = tamanho > 0 ? tamanho : 50;
        t.donoUserId = donoUserId;
        t.templateId = (templateId != null && !templateId.isBlank()) ? templateId : null;
        t.cenaId = (cenaId != null && !cenaId.isBlank()) ? cenaId : null;
        t.nomeVisivel = true;
        t.statusVisivel = true;
        return t;
    }
}
