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

@RestController
@RequestMapping("/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/{characterId}")
    public ResponseEntity<ItemDTO> addItem(@PathVariable String characterId, @RequestBody ItemDTO dto) {
        return ResponseEntity.ok(itemService.addItem(characterId, dto));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/toggle")
    public ResponseEntity<ItemDTO> toggleEquip(@PathVariable String itemId) {
        return ResponseEntity.ok(itemService.toggleEquip(itemId));
    }
}