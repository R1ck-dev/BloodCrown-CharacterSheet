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
 * Entidade JPA de pasta da biblioteca (tabela "mesa_biblioteca_pastas"). Filho do agregado Mesa
 * com FK mesa_id. Organiza os templates em um nível. Id gerado no domínio.
 */
@Entity
@Table(name = "mesa_biblioteca_pastas")
@Getter
@Setter
public class BibliotecaPastaJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "nome")
    private String nome;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private MesaJpaEntity mesa;
}
