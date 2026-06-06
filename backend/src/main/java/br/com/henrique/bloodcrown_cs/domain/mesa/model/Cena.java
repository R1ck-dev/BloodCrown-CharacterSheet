package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Cena de uma mesa: um mapa de fundo com seu próprio grid, escala de medição e transformação
 * (posição/tamanho/trava). Uma mesa tem várias cenas e uma cena ativa; trocar de cena troca o
 * mapa e os tokens exibidos (os tokens guardam a {@code cenaId} a que pertencem). Sub-entidade
 * do agregado {@link Mesa}. Id gerado no domínio (UUID).
 *
 * <p>{@code mapaLargura}/{@code mapaAltura} em 0 = "tamanho natural da imagem" (o front usa as
 * dimensões reais). {@code mapaTravado} = mapa fixo como fundo (não arrastável/redimensionável).
 */
@Getter
@Setter
public class Cena {

    private String id;
    private String nome;
    /** Ordem de exibição das abas de cena. */
    private int ordem;
    private String mapaUrl;
    private Grid grid;
    /** Quanto vale 1 célula do grid em unidades de jogo (ex.: 1.5 = "1 célula = 1,5 m"). */
    private double escalaValor;
    /** Unidade da escala (ex.: "m", "ft"). */
    private String escalaUnidade;
    private int mapaX;
    private int mapaY;
    /** Largura do mapa em px; 0 = tamanho natural da imagem. */
    private int mapaLargura;
    /** Altura do mapa em px; 0 = tamanho natural da imagem. */
    private int mapaAltura;
    /** Mapa travado como fundo (não arrastável/redimensionável). */
    private boolean mapaTravado;

    public Cena() {
    }

    /** Cria uma cena nova com id gerado no domínio e padrões sensatos. */
    public static Cena criar(String nome, int ordem) {
        Cena c = new Cena();
        c.id = UUID.randomUUID().toString();
        c.nome = (nome != null && !nome.isBlank()) ? nome : "Cena";
        c.ordem = ordem;
        c.mapaUrl = null;
        c.grid = new Grid();
        c.escalaValor = 1.5;
        c.escalaUnidade = "m";
        c.mapaX = 0;
        c.mapaY = 0;
        c.mapaLargura = 0;
        c.mapaAltura = 0;
        c.mapaTravado = true;
        return c;
    }
}
