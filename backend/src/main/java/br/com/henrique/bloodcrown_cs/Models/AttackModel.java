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
 * Representa um ataque ou arma registrado na ficha do personagem.
 * Mapeia a tabela "attacks".
 */
@Entity
@Table(name = "attacks")
@Data
public class AttackModel {
    
    /**
     * Chave primária do ataque.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Nome da arma ou ataque.
     */
    @Column
    private String name;

    /**
     * Fórmula de dano (ex: "1d8+3").
     */
    @Column
    private String damageDice;

    /**
     * Descrição adicional, como tipo de dano ou propriedades especiais.
     */
    @Column
    private String description;

    /**
     * Personagem a quem este ataque pertence.
     */
    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}