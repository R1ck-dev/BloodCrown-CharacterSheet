package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

/**
 * Gerencia os estados vitais e defensivos do personagem.
 * Armazena os valores atuais e máximos de recursos (Vida, Mana, etc.), bem como
 * os cálculos de defesa e resistências.
 */
@Embeddable
@Data
public class CharacterStatus {
    
    // --- Recursos Vitais ---

    /**
     * Valor máximo de Pontos de Vida (HP).
     */
    @Column(name = "max_health")
    private Integer maxHealth;

    /**
     * Valor atual de Pontos de Vida. Se chegar a 0, o personagem cai.
     */
    @Column(name = "current_health")
    private Integer currentHealth;

    /**
     * Valor máximo de Sanidade.
     */
    @Column(name = "max_sanity")
    private Integer maxSanity;

    /**
     * Valor atual de Sanidade. Afeta a estabilidade mental do personagem.
     */
    @Column(name = "current_sanity")
    private Integer currentSanity;

    /**
     * Valor máximo de Mana (recurso para magias).
     */
    @Column(name = "max_mana")
    private Integer maxMana;

    /**
     * Valor atual de Mana.
     */
    @Column(name = "current_mana")
    private Integer currentMana;

    /**
     * Valor máximo de Estamina (recurso para esforços físicos).
     */
    @Column(name = "max_stamina")
    private Integer maxStamina;

    /**
     * Valor atual de Estamina.
     */
    @Column(name = "current_stamina")
    private Integer currentStamina;
    
    // --- Defesas e Resistências ---

    /**
     * Valor total da Defesa (soma de Base + Armadura + Outros).
     * Determina a dificuldade para acertar o personagem.
     */
    @Column(name = "defense")
    private Integer defense;

    /**
     * Defesa base, geralmente derivada de Atributos (ex: Destreza).
     */
    @Column(name = "defense_base")
    private Integer defenseBase;

    /**
     * Bônus de defesa proveniente de equipamentos (armaduras, escudos).
     */
    @Column(name = "armor_bonus")
    private Integer armorBonus;

    /**
     * Bônus diversos (magias, talentos, etc.).
     */
    @Column(name = "other_bonus")
    private Integer otherBonus;

    /**
     * Redução de dano físico direto.
     */
    @Column(name = "physical_res")
    private Integer physicalRes;

    /**
     * Redução de dano mágico direto.
     */
    @Column(name = "magical_res")
    private Integer magicalRes;
}