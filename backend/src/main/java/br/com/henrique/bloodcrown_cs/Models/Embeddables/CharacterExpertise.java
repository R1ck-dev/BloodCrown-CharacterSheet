package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CharacterExpertise {
    @Column(name = "atletismo")
    private Integer atletismo;

    @Column(name = "conhecimento")
    private Integer conhecimento;

    @Column(name = "consertar")
    private Integer consertar;

    @Column(name = "diplomacia")
    private Integer diplomacia;

    @Column(name = "domar")
    private Integer domar;

    @Column(name = "empatia")
    private Integer empatia;

    @Column(name = "fortitude")
    private Integer fortitude;

    @Column(name = "furtividade")
    private Integer furtividade;

    @Column(name = "magia")
    private Integer magia;

    @Column(name = "iniciativa")
    private Integer iniciativa;

    @Column(name = "intimidar")
    private Integer intimidar;

    @Column(name = "intuicao")
    private Integer intuicao;

    @Column(name = "investigacao")
    private Integer investigacao;

    @Column(name = "labia")
    private Integer labia;

    @Column(name = "ladinagem")
    private Integer ladinagem;

    @Column(name = "luta")
    private Integer luta;

    @Column(name = "medicina")
    private Integer medicina;

    @Column(name = "mente")
    private Integer mente;

    @Column(name = "percepcao")
    private Integer percepcao;

    @Column(name = "pontaria")
    private Integer pontaria;

    @Column(name = "reflexos")
    private Integer reflexos;

    @Column(name = "seduzir")
    private Integer seduzir;

    @Column(name = "sobrevivencia")
    private Integer sobrevivencia;

}
