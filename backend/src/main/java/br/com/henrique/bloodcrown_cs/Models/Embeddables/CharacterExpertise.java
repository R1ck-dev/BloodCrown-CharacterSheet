package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

/**
 * Representa o conjunto de perícias e competências técnicas do personagem.
 * Assim como os atributos, esta classe é embutida na entidade CharacterModel,
 * organizando os modificadores de habilidades específicas.
 */
@Embeddable
@Data
public class CharacterExpertise {
    // Perícias Físicas
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

    // Perícias Mentais e de Conhecimento
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

    // Perícias de Interação e Sentidos
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

    // Perícias Práticas e de Sobrevivência
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