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

@Entity
@Table(name = "attacks")
@Data
public class AttackModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column
    private String name;

    @Column
    private String testDice;

    @Column
    private String damageDice;

    @Column
    private String description;

    @ManyToOne
    @JoinColumn(name = "characted_id")
    @JsonIgnore
    private CharacterModel character;
}
