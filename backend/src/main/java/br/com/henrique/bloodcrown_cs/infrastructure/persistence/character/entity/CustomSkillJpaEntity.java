package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA de perícia personalizada (tabela "custom_skills"). Coluna skill_value
 * (não "value", reservada no MySQL) — idêntico ao antigo CustomSkillModel.
 */
@Entity
@Table(name = "custom_skills")
@Getter
@Setter
public class CustomSkillJpaEntity {

    @Id
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "attribute")
    private String attribute;

    @Column(name = "skill_value")
    private Integer value;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterJpaEntity character;
}
