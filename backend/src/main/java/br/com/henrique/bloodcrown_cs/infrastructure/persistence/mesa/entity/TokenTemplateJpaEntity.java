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
 * Entidade JPA do template de token (tabela "mesa_token_templates"). Filho do agregado Mesa
 * com FK mesa_id. Sem posição — é o molde pré-carregado na biblioteca. Id gerado no domínio.
 */
@Entity
@Table(name = "mesa_token_templates")
@Getter
@Setter
public class TokenTemplateJpaEntity {

    @Id
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "imagem_url", length = 512)
    private String imagemUrl;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private MesaJpaEntity mesa;
}
