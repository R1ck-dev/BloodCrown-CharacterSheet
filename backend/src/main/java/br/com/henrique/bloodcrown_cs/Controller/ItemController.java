package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
     * Adiciona um novo item ao inventário de um personagem específico.
     * * @param characterId Identificador do personagem que receberá o item.
     * @param dto Objeto contendo os dados do item (nome, peso, tipo, etc.).
     * @return ResponseEntity com o item criado.
     */
    @PostMapping("/{characterId}")
    public ResponseEntity<ItemDTO> addItem(@PathVariable String characterId, @RequestBody ItemDTO dto) {
        return ResponseEntity.ok(itemService.addItem(characterId, dto));
    }

    /**
     * Remove um item do inventário.
     * * @param itemId Identificador único do item a ser removido.
     * @return ResponseEntity com status 204 (No Content).
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Alterna o estado de um item entre "Equipado" e "Desequipado".
     * Essa ação pode desencadear recálculos de atributos do personagem no serviço.
     * * @param itemId Identificador do item.
     * @return ResponseEntity com o item atualizado refletindo o novo estado.
     */
    @PostMapping("/{itemId}/toggle")
    public ResponseEntity<ItemDTO> toggleEquip(@PathVariable String itemId) {
        return ResponseEntity.ok(itemService.toggleEquip(itemId));
    }
}