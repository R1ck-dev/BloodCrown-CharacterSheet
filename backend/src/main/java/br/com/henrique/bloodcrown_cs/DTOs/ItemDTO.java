package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Representa um item ou equipamento no inventário do personagem.
 * Possui propriedades que indicam se o item está em uso e se ele confere
 * bônus mecânicos aos atributos do personagem.
 * * @param id Identificador único do item.
 * @param name Nome do item.
 * @param description Descrição ou detalhes do item.
 * @param isEquipped Estado do item (true se estiver sendo usado/vestido).
 * @param targetAttribute Atributo que este item modifica (ex: "defense", "strength").
 * @param effectValue Valor numérico do modificador aplicado.
 */
public record ItemDTO(
    String id,
    String name,
    String description,
    Boolean isEquipped,
    String targetAttribute,
    Integer effectValue
) {}