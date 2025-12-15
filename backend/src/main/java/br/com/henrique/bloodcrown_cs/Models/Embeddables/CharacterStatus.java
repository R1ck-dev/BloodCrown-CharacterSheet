package br.com.henrique.bloodcrown_cs.Models.Embeddables;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CharacterStatus {
    @Column(name = "max_health")
    private Integer maxHealth;

    @Column(name = "current_health")
    private Integer currentHealth;

    @Column(name = "max_sanity")
    private Integer maxSanity;

    @Column(name = "current_sanity")
    private Integer currentSanity;

    @Column(name = "max_mana")
    private Integer maxMana;

    @Column(name = "current_mana")
    private Integer currentMana;

    @Column(name = "max_stamina")
    private Integer maxStamina;

    @Column(name = "current_stamina")
    private Integer currentStamina;
    
    @Column(name = "defense")
    private Integer defense;
}
