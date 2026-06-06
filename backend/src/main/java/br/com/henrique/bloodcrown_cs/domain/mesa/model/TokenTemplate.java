package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Template de token na biblioteca da mesa (nome + arte pré-carregada). Não tem posição:
 * é o "molde" que o usuário coloca na mesa quantas vezes quiser, virando {@link Token}s.
 *
 * <p>Pode ser organizado em uma {@link BibliotecaPasta} ({@code pastaId}) e pode ser uma
 * <b>versão</b> de outro template base ({@code baseId} aponta para o id do template base; nulo =
 * é um template base/independente). O conjunto "base + suas versões" forma um grupo de troca
 * rápida no tabuleiro — só um nível (uma versão nunca é base de outra).
 */
@Getter
@Setter
public class TokenTemplate {

    private String id;
    private String nome;
    private String imagemUrl;
    /** Tipo do item: token (criatura/PJ), mapa (cena) ou documento (handout). Default TOKEN. */
    private TipoTemplate tipo = TipoTemplate.TOKEN;
    /** Id do template base do qual este é uma versão; nulo = é um template base. */
    private String baseId;
    /** Id da pasta onde está organizado; nulo = raiz da biblioteca. */
    private String pastaId;

    public TokenTemplate() {
    }

    public static TokenTemplate criar(String nome, String imagemUrl, TipoTemplate tipo, String baseId, String pastaId) {
        TokenTemplate t = new TokenTemplate();
        t.id = UUID.randomUUID().toString();
        t.nome = nome;
        t.imagemUrl = imagemUrl;
        t.tipo = tipo != null ? tipo : TipoTemplate.TOKEN;
        // Só token tem versões; mapa/documento nunca são versão de outro item.
        t.baseId = (t.tipo == TipoTemplate.TOKEN && baseId != null && !baseId.isBlank()) ? baseId : null;
        t.pastaId = (pastaId != null && !pastaId.isBlank()) ? pastaId : null;
        return t;
    }

    /** Id do grupo de versões: o próprio base ou, se este for uma versão, o id do base. */
    public String grupoId() {
        return baseId != null ? baseId : id;
    }
}
