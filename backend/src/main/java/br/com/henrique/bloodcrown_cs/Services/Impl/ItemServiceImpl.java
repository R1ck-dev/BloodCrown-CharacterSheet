package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.ItemModel;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Repositories.ItemRepository;
import br.com.henrique.bloodcrown_cs.Services.ItemService;

@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final CharacterRepository characterRepository;

    public ItemServiceImpl(ItemRepository itemRepository, CharacterRepository characterRepository) {
        this.itemRepository = itemRepository;
        this.characterRepository = characterRepository;
    }

    @Override
    public ItemDTO addItem(String characterId, ItemDTO dto) {
        CharacterModel character = characterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado"));

        ItemModel item = new ItemModel();
        item.setName(dto.name());
        item.setDescription(dto.description());
        item.setTargetAttribute(dto.targetAttribute());
        item.setEffectValue(dto.effectValue());
        item.setIsEquipped(false);
        item.setCharacter(character);

        ItemModel saved = itemRepository.save(item);
        return convertToDTO(saved);
    }

    @Override
    public void deleteItem(String itemId) {
        itemRepository.deleteById(itemId);
    }

    @Override
    public ItemDTO toggleEquip(String itemId) {
        ItemModel item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        
        item.setIsEquipped(!Boolean.TRUE.equals(item.getIsEquipped()));
        ItemModel saved = itemRepository.save(item);
        return convertToDTO(saved);
    }

    private ItemDTO convertToDTO(ItemModel item) {
        return new ItemDTO(item.getId(), item.getName(), item.getDescription(), item.getIsEquipped(), item.getTargetAttribute(), item.getEffectValue());
    }
}