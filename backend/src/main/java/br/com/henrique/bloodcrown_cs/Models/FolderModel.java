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
 * Pasta de organizacao de fichas. Estrutura flat (sem aninhamento) — cada
 * pasta pertence a um usuario e agrupa personagens via FK no CharacterModel.
 */
@Entity
@Table(name = "folders")
@Data
public class FolderModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    /** Nome da pasta exibido na sidebar. */
    @Column(name = "name", length = 60, nullable = false)
    private String name;

    /** Usuario dono da pasta. */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserModel fromUser;
}
