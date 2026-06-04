package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

/**
 * Embeddable JPA das 23 perícias fixas — colunas idênticas ao antigo CharacterExpertise.
 */
@Embeddable
@Getter
@Setter
public class ExpertiseEmbeddable {
    @Column(name = "atletismo")
    private Integer atletismo;
    @Column(name = "luta")
    private Integer luta;
    @Column(name = "pontaria")
    private Integer pontaria;
    @Column(name = "reflexos")
    private Integer reflexos;
    @Column(name = "fortitude")
    private Integer fortitude;
    @Column(name = "furtividade")
    private Integer furtividade;
    @Column(name = "conhecimento")
    private Integer conhecimento;
    @Column(name = "investigacao")
    private Integer investigacao;
    @Column(name = "medicina")
    private Integer medicina;
    @Column(name = "mente")
    private Integer mente;
    @Column(name = "magia")
    private Integer magia;
    @Column(name = "percepcao")
    private Integer percepcao;
    @Column(name = "intuicao")
    private Integer intuicao;
    @Column(name = "empatia")
    private Integer empatia;
    @Column(name = "diplomacia")
    private Integer diplomacia;
    @Column(name = "intimidar")
    private Integer intimidar;
    @Column(name = "labia")
    private Integer labia;
    @Column(name = "seduzir")
    private Integer seduzir;
    @Column(name = "consertar")
    private Integer consertar;
    @Column(name = "domar")
    private Integer domar;
    @Column(name = "iniciativa")
    private Integer iniciativa;
    @Column(name = "ladinagem")
    private Integer ladinagem;
    @Column(name = "sobrevivencia")
    private Integer sobrevivencia;
}
