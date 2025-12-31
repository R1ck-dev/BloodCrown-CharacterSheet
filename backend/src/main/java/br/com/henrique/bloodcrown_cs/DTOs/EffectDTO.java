package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Estrutura auxiliar que define um efeito numérico simples.
 * Geralmente utilizada dentro de habilidades ou itens para descrever alterações de status.
 * * @param target O alvo ou atributo afetado (ex: "HEALTH", "MANA").
 * @param value A magnitude do efeito (pode ser positivo para cura/bônus ou negativo para dano/penalidade).
 */
public record EffectDTO(String target, Integer value) {
}