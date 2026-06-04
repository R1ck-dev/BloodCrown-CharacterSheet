package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

/**
 * Embeddable JPA dos atributos base — colunas idênticas ao antigo CharacterAttributes.
 */
@Embeddable
@Getter
@Setter
public class AttributesEmbeddable {
    @Column(name = "forca")
    private Integer forca;
    @Column(name = "destreza")
    private Integer destreza;
    @Column(name = "sabedoria")
    private Integer sabedoria;
    @Column(name = "inteligencia")
    private Integer inteligencia;
    @Column(name = "carisma")
    private Integer carisma;
    @Column(name = "constituicao")
    private Integer constituicao;
}
