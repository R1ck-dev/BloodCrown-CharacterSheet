package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Agrupa os indicadores vitais e defensivos do personagem.
 * Gerencia os valores atuais e máximos de Vida, Mana, Sanidade e Estamina,
 * além de calcular as defesas físicas e mágicas baseadas em equipamentos e atributos.
 * * @param maxHealth Pontos de Vida máximos.
 * @param currentHealth Pontos de Vida atuais.
 * @param maxSanity Sanidade máxima.
 * @param currentSanity Sanidade atual.
 * @param maxMana Mana máxima.
 * @param currentMana Mana atual.
 * @param maxStamina Estamina máxima.
 * @param currentStamina Estamina atual.
 * @param defense Valor final da defesa física.
 * @param defenseBase Valor base da defesa (geralmente vindo de Atributos).
 * @param armorBonus Bônus fornecido por armaduras equipadas.
 * @param otherBonus Outros modificadores diversos.
 * @param physicalRes Resistência a dano físico.
 * @param magicalRes Resistência a dano mágico.
 */
public record StatusDTO(
    Integer maxHealth,
    Integer currentHealth,
    Integer maxSanity,
    Integer currentSanity,
    Integer maxMana,
    Integer currentMana,
    Integer maxStamina,
    Integer currentStamina,
    Integer defense,
    Integer defenseBase,
    Integer armorBonus,
    Integer otherBonus,
    Integer physicalRes,
    Integer magicalRes
) {
}