package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Representa um item ou equipamento no inventário do personagem.
 * Possui propriedades que indicam se o item está em uso e se ele confere
 * bônus mecânicos aos atributos do personagem.
 *
 * @param quantity Quantidade na mochila (consumíveis empilhados). Mín 0, default 1.
 * @param useDice Fórmula rolada ao "Usar" o item (poções). Combina com targetAttribute
 *                RESTORE_HP/MANA/STAMINA pra aplicar o resultado à barra.
 */
public record ItemDTO(
    String id,
    String name,
    String description,
    Boolean isEquipped,
    String targetAttribute,
    Integer effectValue,
    Integer quantity,
    String useDice
) {}