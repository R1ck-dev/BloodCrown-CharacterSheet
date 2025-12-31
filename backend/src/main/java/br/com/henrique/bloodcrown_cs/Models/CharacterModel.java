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

/**
 * Entidade central do sistema, representando a Ficha de Personagem completa.
 * Agrega informações básicas e compõe atributos complexos através de objetos embutidos (Embeddables).
 */
@Entity
@Table(name = "characters")
@Data
public class CharacterModel {
    /**
     * Identificador único do personagem.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    /**
     * Usuário proprietário da ficha.
     * O relacionamento ManyToOne indica que um usuário pode ter vários personagens.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) //Cria a coluna "user_id" no BD que não pode ser nula
    private UserModel fromUser;

    /**
     * Nome do personagem.
     */
    @Column(name = "name")
    private String name;

    /**
     * Classe ou arquétipo do personagem.
     */
    @Column(name = "char_class")
    private String characterClass;

    /**
     * Nível atual do personagem.
     */
    @Column(name = "level")
    private Integer level;

    /**
     * Objeto embutido contendo os atributos base (Força, Destreza, etc.).
     * Os campos desta classe serão mapeados como colunas na tabela 'characters'.
     */
    @Embedded
    private CharacterAttributes attributes;

    /**
     * Objeto embutido contendo status vitais e defesas.
     */
    @Embedded
    private CharacterStatus status;
    
    /**
     * Objeto embutido contendo as perícias.
     */
    @Embedded 
    private CharacterExpertise expertise;

    /**
     * Lista de ataques associados.
     * O CascadeType.ALL garante que operações no personagem (como deletar) se propaguem para seus ataques.
     */
    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttackModel> attacks;

    /**
     * Lista de habilidades associadas.
     */
    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AbilityModel> abilities;

    /**
     * Lista de itens no inventário.
     */
    @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemModel> inventory;

    /**
     * Representação textual da riqueza do personagem.
     */
    @Column(name = "money")
    private String money; 

    /**
     * Pontos de herói disponíveis para uso.
     */
    @Column(name = "heroi_point")
    private Integer heroPoint; 
    
    /**
     * Texto livre contendo a história ou biografia do personagem.
     */
    @Column(name = "biography" ,columnDefinition = "TEXT") 
    private String biography;
}