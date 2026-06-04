package br.com.henrique.bloodcrown_cs.domain.character.model;

import lombok.Getter;
import lombok.Setter;

/**
 * Value object dos atributos base do personagem. Data holder mutável
 * (manipulado pelas regras na raiz {@link Character} e pelo mapper de persistência).
 */
@Getter
@Setter
public class Attributes {
    private Integer forca;
    private Integer destreza;
    private Integer sabedoria;
    private Integer inteligencia;
    private Integer carisma;
    private Integer constituicao;
}
