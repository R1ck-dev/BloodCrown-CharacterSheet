package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CharacterAttributes {
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
