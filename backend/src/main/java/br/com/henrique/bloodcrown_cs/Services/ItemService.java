package br.com.henrique.bloodcrown_cs.Services;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;

/**
 * Interface que define as operações de manipulação de itens no inventário.
 */
public interface ItemService {

    /**
     * Adiciona um novo item ao inventário de um personagem.
     * * @param characterId Identificador do personagem proprietário.
     * @param dto Dados do item a ser criado.
     * @return O item persistido com seu ID gerado.
     */
    ItemDTO addItem(String characterId, ItemDTO dto);

    /**
     * Remove um item do banco de dados.
     * * @param itemId Identificador do item a ser removido.
     */
    void deleteItem(String itemId);

    /**
     * Alterna o estado de "Equipado" de um item.
     * Se o item for equipado/desequipado, deve disparar a lógica de recálculo
     * dos atributos do personagem (ex: Defesa, Bônus).
     * * @param itemId Identificador do item.
     * @return O item com o estado atualizado.
     */
    ItemDTO toggleEquip(String itemId);
}