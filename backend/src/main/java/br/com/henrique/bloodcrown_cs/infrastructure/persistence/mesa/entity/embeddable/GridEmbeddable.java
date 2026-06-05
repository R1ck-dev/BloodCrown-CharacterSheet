package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

/** Embeddable do grid (colunas grid_* na tabela mesas). */
@Embeddable
@Getter
@Setter
public class GridEmbeddable {

    @Column(name = "grid_cell_size", nullable = false)
    private int tamanhoCelula;

    @Column(name = "grid_visivel", nullable = false)
    private boolean visivel;

    @Column(name = "grid_cor", length = 20)
    private String cor;
}
