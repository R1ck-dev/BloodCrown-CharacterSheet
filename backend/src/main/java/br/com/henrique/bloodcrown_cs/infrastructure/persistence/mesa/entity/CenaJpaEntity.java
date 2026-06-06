package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.embeddable.GridEmbeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA de cena (tabela "mesa_cenas"). Filho do agregado Mesa com FK mesa_id. Cada cena
 * tem seu mapa, grid (embeddable), escala de medição e transformação (posição/tamanho/trava).
 * Id gerado no domínio.
 */
@Entity
@Table(name = "mesa_cenas")
@Getter
@Setter
public class CenaJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private MesaJpaEntity mesa;

    @Column(name = "nome")
    private String nome;

    @Column(name = "ordem", nullable = false)
    private int ordem;

    @Column(name = "mapa_url", length = 512)
    private String mapaUrl;

    @Embedded
    private GridEmbeddable grid;

    @Column(name = "escala_valor", nullable = false)
    private double escalaValor;

    @Column(name = "escala_unidade", length = 20)
    private String escalaUnidade;

    @Column(name = "mapa_x", nullable = false)
    private int mapaX;

    @Column(name = "mapa_y", nullable = false)
    private int mapaY;

    @Column(name = "mapa_largura", nullable = false)
    private int mapaLargura;

    @Column(name = "mapa_altura", nullable = false)
    private int mapaAltura;

    @Column(name = "mapa_travado", nullable = false)
    private boolean mapaTravado;
}
