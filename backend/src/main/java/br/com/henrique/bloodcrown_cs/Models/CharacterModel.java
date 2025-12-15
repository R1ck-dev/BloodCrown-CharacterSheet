package br.com.henrique.bloodcrown_cs.Models;

import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterAttributes;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterExpertise;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
}
