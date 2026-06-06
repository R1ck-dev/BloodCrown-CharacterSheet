package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA de token (tabela "mesa_tokens"). Filho do agregado Mesa, com FK mesa_id.
 * Id atribuído pelo domínio. Posições/tamanho em pixels inteiros do mapa.
 */
@Entity
@Table(name = "mesa_tokens")
@Getter
@Setter
public class TokenJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "imagem_url", length = 512)
    private String imagemUrl;

    @Column(name = "cor", length = 20)
    private String cor;

    @Column(name = "pos_x", nullable = false)
    private int x;

    @Column(name = "pos_y", nullable = false)
    private int y;

    @Column(name = "tamanho", nullable = false)
    private int tamanho;

    @Column(name = "dono_user_id", columnDefinition = "VARCHAR(36)")
    private String donoUserId;

    /** Template/versão que este token representa; nulo = avulso. String solta, não FK JPA. */
    @Column(name = "template_id", columnDefinition = "VARCHAR(36)")
    private String templateId;

    /** Cena a que o token pertence; só aparece quando é a cena ativa. String solta, não FK JPA. */
    @Column(name = "cena_id", columnDefinition = "VARCHAR(36)")
    private String cenaId;

    /** Mostra o nome embaixo do token no tabuleiro. */
    @Column(name = "nome_visivel", nullable = false)
    private boolean nomeVisivel;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private MesaJpaEntity mesa;
}
