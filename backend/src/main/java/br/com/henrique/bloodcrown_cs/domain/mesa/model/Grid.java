package br.com.henrique.bloodcrown_cs.domain.mesa.model;

import lombok.Getter;
import lombok.Setter;

/**
 * Value object do grid (quadriculado) sobreposto ao mapa da mesa.
 * tamanhoCelula em pixels do mapa; visivel liga/desliga o desenho; cor em hex.
 */
@Getter
@Setter
public class Grid {

    private int tamanhoCelula;
    private boolean visivel;
    private String cor;

    public Grid() {
        this.tamanhoCelula = 50;
        this.visivel = true;
        this.cor = "#000000";
    }

    public Grid(int tamanhoCelula, boolean visivel, String cor) {
        this.tamanhoCelula = tamanhoCelula > 0 ? tamanhoCelula : 50;
        this.visivel = visivel;
        this.cor = (cor != null && !cor.isBlank()) ? cor : "#000000";
    }
}
