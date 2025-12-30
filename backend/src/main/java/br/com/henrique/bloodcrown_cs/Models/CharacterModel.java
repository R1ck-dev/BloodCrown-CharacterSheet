package br.com.henrique.bloodcrown_cs.Models;

import java.util.List;

import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterAttributes;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterExpertise;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "characters")
@Data
public class CharacterModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) //Cria a coluna "user_id" no BD que não pode ser nula
    private UserModel fromUser;

    @Column(name = "name")
    private String name;

    @Column(name = "char_class")
    private String characterClass;

    @Column(name = "level")
    private Integer level;

    @Embedded
    private CharacterAttributes attributes;

    @Embedded
    private CharacterStatus status;
    
    @Embedded 
    private CharacterExpertise expertise;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttackModel> attacks;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AbilityModel> abilities;

    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemModel> inventory;

    @Column(name = "money")
    private String money; 

    @Column(name = "heroi_point")
    private Integer heroPoint; 
    
    @Column(name = "biography" ,columnDefinition = "TEXT") 
    private String biography;
}
