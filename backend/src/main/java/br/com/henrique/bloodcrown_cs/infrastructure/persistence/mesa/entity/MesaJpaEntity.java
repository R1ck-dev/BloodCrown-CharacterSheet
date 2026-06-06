package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.embeddable.GridEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade JPA da mesa tabletop (tabela "mesas"). Raiz que cascateia os tokens
 * (orphanRemoval) e mantém os participantes numa @ElementCollection (mesa_participantes).
 * Id e código de convite atribuídos pelo domínio.
 */
@Entity
@Table(name = "mesas")
@Getter
@Setter
public class MesaJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "nome", length = 100, nullable = false)
    private String nome;

    @ManyToOne
    @JoinColumn(name = "dono_user_id", nullable = false)
    private UserJpaEntity dono;

    @Column(name = "mapa_url", length = 512)
    private String mapaUrl;

    @Embedded
    private GridEmbeddable grid;

    @Column(name = "codigo_convite", length = 12, unique = true)
    private String codigoConvite;

    @OneToMany(mappedBy = "mesa", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    private List<TokenJpaEntity> tokens = new ArrayList<>();

    @OneToMany(mappedBy = "mesa", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 30)
    private List<TokenTemplateJpaEntity> biblioteca = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "mesa_participantes", joinColumns = @JoinColumn(name = "mesa_id"))
    @Column(name = "user_id", columnDefinition = "VARCHAR(36)")
    private Set<String> participantes = new LinkedHashSet<>();
}
