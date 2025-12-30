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
@Table(name = "items")
@Data
public class ItemModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;
    
    @Column(name = "is_equipped")
    private Boolean isEquipped = false; 
    
    @Column(name = "target_attribute")
    private String targetAttribute; 

    @Column(name = "effect_value")
    private Integer effectValue;    

    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}