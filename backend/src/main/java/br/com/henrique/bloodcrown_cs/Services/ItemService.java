package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;

/**
 * Interface que define as operações de manipulação de itens no inventário.
 */
public interface ItemService {

    /**
     * Adiciona um novo item ao inventário de um personagem. Valida ownership.
     */
    ItemDTO addItem(String characterId, ItemDTO dto, Authentication authentication);

    /**
     * Atualiza um item existente (nome, descrição, efeito mágico). Preserva o estado
     * runtime (isEquipped) — editar definição do item não desequipa. Valida ownership.
     */
    ItemDTO updateItem(String itemId, ItemDTO dto, Authentication authentication);

    /**
     * Remove um item do banco de dados. Valida que o item pertence ao usuário autenticado.
     */
    void deleteItem(String itemId, Authentication authentication);

    /**
     * Alterna o estado de "Equipado" de um item. Valida ownership.
     */
    ItemDTO toggleEquip(String itemId, Authentication authentication);
}