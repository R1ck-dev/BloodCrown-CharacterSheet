package br.com.henrique.bloodcrown_cs.DTOs;

import java.util.List;

/**
 * DTO principal que representa a Ficha de Personagem Completa.
 * Este objeto agrega todas as informações necessárias para renderizar a ficha na interface,
 * incluindo atributos, status vitais, inventário, habilidades e biografia.
 * É utilizado principalmente nas operações de leitura detalhada (GET por ID).
 * * @param id Identificador único da ficha.
 * @param name Nome do personagem.
 * @param characterClass Classe ou arquétipo.
 * @param level Nível atual de experiência.
 * @param attributes Objeto contendo os atributos base (Força, Destreza, etc.).
 * @param status Objeto contendo os recursos vitais (Vida, Mana, Defesas).
 * @param expertise Objeto contendo a lista de perícias.
 * @param attacks Lista de ataques e armas disponíveis.
 * @param abilities Lista de habilidades e magias conhecidas.
 * @param inventory Lista de itens possuídos.
 * @param money Representação monetária (ex: "100 PO").
 * @param heroPoint Pontos de herói ou inspiração disponíveis.
 * @param biography Texto descritivo da história do personagem.
 */
public record CharacterSheetDTO(
    String id,
    String name,
    String characterClass,
    Integer level,
    AttributesDTO attributes,
    StatusDTO status,
    ExpertiseDTO expertise,
    List<AttackDTO> attacks,
    List<AbilityDTO> abilities,
    List<ItemDTO> inventory,
    String money,
    Integer heroPoint,
    String biography
) {
    
}