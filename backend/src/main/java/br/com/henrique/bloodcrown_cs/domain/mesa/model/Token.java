package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Token (peça) posicionado no mapa da mesa. Sub-entidade do agregado {@link Mesa}.
 * Tem imagem (R2) ou, na ausência dela, uma cor de fallback. Posição em pixels do mapa.
 * O vínculo com a ficha (characterId) fica para uma fase posterior — aqui é entidade solta.
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

    public Token() {
    }

    /** Cria um token novo com id gerado no domínio. */
    public static Token criar(String nome, String imagemUrl, String cor, int x, int y,
                              int tamanho, String donoUserId) {
        Token t = new Token();
        t.id = UUID.randomUUID().toString();
        t.nome = nome;
        t.imagemUrl = imagemUrl;
        t.cor = (cor != null && !cor.isBlank()) ? cor : "#8b1e2d";
        t.x = x;
        t.y = y;
        t.tamanho = tamanho > 0 ? tamanho : 50;
        t.donoUserId = donoUserId;
        return t;
    }
}
