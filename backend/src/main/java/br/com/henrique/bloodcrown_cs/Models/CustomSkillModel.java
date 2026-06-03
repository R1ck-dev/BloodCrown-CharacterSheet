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
 * Entidade JPA representando uma perícia personalizada criada pelo jogador.
 * Mapeia a tabela "custom_skills".
 *
 * Diferente das 23 perícias fixas (value object @Embedded CharacterExpertise),
 * estas são uma coleção dinâmica @OneToMany no personagem — o jogador adiciona/
 * remove livremente, cada uma vinculada a um atributo. Seguem o mesmo padrão de
 * ataques/habilidades/itens (geridas por endpoints dedicados, não pelo PATCH da ficha).
 */
@Entity
@Table(name = "custom_skills")
@Data
public class CustomSkillModel {

    /**
     * Identificador único da perícia personalizada.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * Nome da perícia (ex: "Perícia de Éter").
     */
    @Column(name = "name")
    private String name;

    /**
     * Atributo de vínculo, armazenado como String espelhando as chaves do front
     * ("forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma").
     * String (não enum nativo) pra permitir evoluir sem ALTER TABLE.
     */
    @Column(name = "attribute")
    private String attribute;

    /**
     * Bônus da perícia, somado ao atributo na rolagem.
     * Coluna "skill_value" (não "value", que é palavra reservada no MySQL).
     */
    @Column(name = "skill_value")
    private Integer value;

    /**
     * Personagem proprietário da perícia.
     */
    @ManyToOne
    @JoinColumn(name = "character_id")
    @JsonIgnore
    private CharacterModel character;
}
