package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CharacterExpertise {
    @Column(name = "atletismo")
    private Integer atletismo;

    @Column(name = "luta")
    private Integer luta;

    @Column(name = "percepcao")
    private Integer percepcao;
}
