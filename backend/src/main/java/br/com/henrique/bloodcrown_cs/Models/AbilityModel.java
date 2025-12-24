package br.com.henrique.bloodcrown_cs.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.henrique.bloodcrown_cs.Enums.AbilityCategoryEnum;
import br.com.henrique.bloodcrown_cs.Enums.AbilityResourceEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "abilities")
@Data
public class AbilityModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private AbilityCategoryEnum category;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type")
    private AbilityResourceEnum resourceType;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "max_uses")
    private Integer maxUses;
    
    @Column(name = "current_uses")
    private Integer currentUses;

    @Column(name = "dice_roll")
    private String diceRoll;

    @Column(name = "target_attribute")
    private String targetAttribute;
    
    @Column(name = "effect_value")
    private Integer effectValue;

    @Column(name = "duration_dice")
    private String durationDice;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "turns_remaining")
    private Integer turnsRemaining;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}
