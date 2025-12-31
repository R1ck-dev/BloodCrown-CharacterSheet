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
 * Entidade JPA representando itens e equipamentos no banco de dados.
 * Mapeia a tabela "items" e define propriedades físicas e mecânicas dos objetos.
 */
@Entity
@Table(name = "items")
@Data
public class ItemModel {
    /**
     * Identificador único do item.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Nome do item.
     */
    @Column(name = "name")
    private String name;

    /**
     * Detalhes sobre o item.
     */
    @Column(name = "description")
    private String description;
    
    /**
     * Estado de uso do item. Se verdadeiro, indica que o item está equipado/vestido.
     */
    @Column(name = "is_equipped")
    private Boolean isEquipped = false; 
    
    /**
     * Define qual atributo do personagem é afetado por este item (ex: "defense").
     */
    @Column(name = "target_attribute")
    private String targetAttribute; 

    /**
     * Valor numérico do bônus ou penalidade aplicado pelo item.
     */
    @Column(name = "effect_value")
    private Integer effectValue;    

    /**
     * Personagem proprietário do item.
     */
    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}