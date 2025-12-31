package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

/**
 * Classe embutível (Embeddable) que agrupa os atributos primários do personagem.
 * Estes campos são mapeados diretamente na tabela "characters", mas organizados
 * aqui para separar a lógica de estatísticas base.
 */
@Embeddable
@Data
public class CharacterAttributes {
    /**
     * Representa a potência muscular e física.
     */
    @Column(name = "forca")
    private Integer forca;

    /**
     * Representa a agilidade, reflexos e coordenação motora.
     */
    @Column(name = "destreza")
    private Integer destreza;

    /**
     * Representa a percepção, força de vontade e intuição.
     */
    @Column(name = "sabedoria")
    private Integer sabedoria;

    /**
     * Representa a capacidade de raciocínio, memória e conhecimento.
     */
    @Column(name = "inteligencia")
    private Integer inteligencia;

    /**
     * Representa a força da personalidade e capacidade de interação social.
     */
    @Column(name = "carisma")
    private Integer carisma;
    
    /**
     * Representa a vitalidade, saúde e resistência física.
     */
    @Column(name = "constituicao")
    private Integer constituicao;
}