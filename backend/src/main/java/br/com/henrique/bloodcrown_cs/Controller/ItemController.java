package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.Services.ItemService;

/**
 * Controlador responsável por gerenciar os itens do inventário dos personagens.
 * Permite adicionar, remover e alterar o estado de equipamento dos itens.
 */
@RestController
@RequestMapping("/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    /**
     * Adiciona um novo item ao inventário de um personagem específico. Valida ownership.
     */
    @PostMapping("/{characterId}")
    public ResponseEntity<ItemDTO> addItem(@PathVariable String characterId, @RequestBody ItemDTO dto, Authentication authentication) {
        return ResponseEntity.ok(itemService.addItem(characterId, dto, authentication));
    }

    /**
     * Atualiza a definição de um item (nome, descrição, efeito mágico).
     * Preserva estado runtime (isEquipped). Valida ownership.
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<ItemDTO> updateItem(@PathVariable String itemId, @RequestBody ItemDTO dto, Authentication authentication) {
        return ResponseEntity.ok(itemService.updateItem(itemId, dto, authentication));
    }

    /**
     * Remove um item do inventário. Valida ownership.
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId, Authentication authentication) {
        itemService.deleteItem(itemId, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * Alterna o estado de um item entre "Equipado" e "Desequipado". Valida ownership.
     */
    @PostMapping("/{itemId}/toggle")
    public ResponseEntity<ItemDTO> toggleEquip(@PathVariable String itemId, Authentication authentication) {
        return ResponseEntity.ok(itemService.toggleEquip(itemId, authentication));
    }
}