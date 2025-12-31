package br.com.henrique.bloodcrown_cs.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entidade auxiliar que representa um efeito específico de uma habilidade.
 * Mapeia a tabela "ability_effects", permitindo que uma habilidade tenha múltiplos impactos mecânicos.
 */
@Entity
@Table(name = "ability_effects")
@Data
public class AbilityEffectModel {
    /**
     * Identificador único do efeito.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Atributo ou status alvo do efeito (ex: "HEALTH", "MANA").
     */
    @Column(name = "target_attribute")
    private String targetAttribute;

    /**
     * Valor numérico do efeito (positivo para bônus/cura, negativo para dano/penalidade).
     */
    @Column(name = "effect_value")
    private Integer effectValue;

    /**
     * Habilidade à qual este efeito pertence.
     */
    @ManyToOne
    @JoinColumn(name = "ability_id")
    @JsonIgnore
    private AbilityModel ability;
}