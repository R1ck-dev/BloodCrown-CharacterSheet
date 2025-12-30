package br.com.henrique.bloodcrown_cs.Services;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;

public interface ItemService {
    ItemDTO addItem(String characterId, ItemDTO dto);
    void deleteItem(String itemId);
    ItemDTO toggleEquip(String itemId);
}
