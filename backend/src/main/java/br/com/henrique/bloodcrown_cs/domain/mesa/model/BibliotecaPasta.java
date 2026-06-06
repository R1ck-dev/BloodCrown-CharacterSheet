package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Pasta da biblioteca da mesa: agrupa templates de token por organização (um nível, sem
 * subpastas). Um template referencia a pasta por id ({@link TokenTemplate#getPastaId()}); ficar
 * sem pasta = raiz da biblioteca. Sub-entidade do agregado {@link Mesa}. Id gerado no domínio.
 */
@Getter
@Setter
public class BibliotecaPasta {

    private String id;
    private String nome;

    public BibliotecaPasta() {
    }

    public static BibliotecaPasta criar(String nome) {
        BibliotecaPasta p = new BibliotecaPasta();
        p.id = UUID.randomUUID().toString();
        p.nome = (nome != null && !nome.isBlank()) ? nome.trim() : "Pasta";
        return p;
    }
}
