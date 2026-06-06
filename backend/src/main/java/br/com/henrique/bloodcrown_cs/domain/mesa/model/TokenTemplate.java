package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Template de token na biblioteca da mesa (nome + arte pré-carregada). Não tem posição:
 * é o "molde" que o usuário coloca na mesa quantas vezes quiser, virando {@link Token}s.
 */
@Getter
@Setter
public class TokenTemplate {

    private String id;
    private String nome;
    private String imagemUrl;

    public TokenTemplate() {
    }

    public static TokenTemplate criar(String nome, String imagemUrl) {
        TokenTemplate t = new TokenTemplate();
        t.id = UUID.randomUUID().toString();
        t.nome = nome;
        t.imagemUrl = imagemUrl;
        return t;
    }
}
