package br.com.henrique.bloodcrown_cs.Models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.henrique.bloodcrown_cs.Enums.AbilityCategoryEnum;
import br.com.henrique.bloodcrown_cs.Enums.AbilityResourceEnum;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entidade que mapeia a tabela "abilities" no banco de dados.
 * Representa as habilidades especiais, magias ou técnicas que um personagem possui.
 * Armazena regras mecânicas como custos, rolagens de dados e efeitos associados.
 */
@Entity
@Table(name = "abilities")
@Data
public class AbilityModel {
    /**
     * Identificador único da habilidade (PK), gerado automaticamente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Nome descritivo da habilidade.
     */
    @Column(name = "name")
    private String name;

    /**
     * Categoria da habilidade (ex: Passiva, Ativa), armazenada como String.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private AbilityCategoryEnum category;

    /**
     * Tipo de recurso consumido ao utilizar a habilidade (ex: MANA, STAMINA).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type")
    private AbilityResourceEnum resourceType;

    /**
     * Define o tipo de ação necessária para execução (ex: Ação Padrão, Movimento).
     */
    @Column(name = "action_type")
    private String actionType;

    /**
     * Número máximo de utilizações permitidas antes de um descanso ou recarga.
     */
    @Column(name = "max_uses")
    private Integer maxUses;
    
    /**
     * Número atual de utilizações restantes.
     */
    @Column(name = "current_uses")
    private Integer currentUses;

    /**
     * Fórmula de rolagem de dados associada à habilidade (ex: "2d6").
     */
    @Column(name = "dice_roll")
    private String diceRoll;

    /**
     * Lista de efeitos mecânicos vinculados a esta habilidade.
     * Relacionamento OneToMany: Uma habilidade pode ter múltiplos efeitos.
     */
    @OneToMany(mappedBy = "ability", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AbilityEffectModel> effects;

    /**
     * Duração do efeito da habilidade expressa em dados ou turnos.
     */
    @Column(name = "duration_dice")
    private String durationDice;

    /**
     * Indica se a habilidade está ativa no momento.
     */
    @Column(name = "is_active")
    private Boolean isActive;

    /**
     * Contador de turnos restantes para o fim do efeito ou recarga.
     */
    @Column(name = "turns_remaining")
    private Integer turnsRemaining;

    /**
     * Descrição textual detalhada do funcionamento da habilidade.
     */
    @Column(length = 2000)
    private String description;

    /**
     * Referência ao personagem que possui esta habilidade.
     * Relacionamento ManyToOne: Muitas habilidades pertencem a um único personagem.
     */
    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}