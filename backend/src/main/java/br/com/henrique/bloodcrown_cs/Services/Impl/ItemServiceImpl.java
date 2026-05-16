package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.Exceptions.NotFoundException;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.ItemModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Repositories.ItemRepository;
import br.com.henrique.bloodcrown_cs.Services.ItemService;

/**
 * Implementação das regras de negócio referentes à gestão de itens do inventário.
 * Gerencia a criação, remoção e alteração de estado dos itens.
 */
@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final CharacterRepository characterRepository;

    public ItemServiceImpl(ItemRepository itemRepository, CharacterRepository characterRepository) {
        this.itemRepository = itemRepository;
        this.characterRepository = characterRepository;
    }

    /**
     * Adiciona um novo item ao inventário de um personagem específico.
     * Valida que o personagem pertence ao usuário autenticado.
     */
    @Override
    public ItemDTO addItem(String characterId, ItemDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel character = characterRepository.findByIdAndFromUserId(characterId, user.getId())
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));

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

    /**
     * Remove um item do banco de dados através do seu ID. Valida ownership.
     */
    @Override
    public void deleteItem(String itemId, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        ItemModel item = itemRepository.findByIdAndCharacter_FromUserId(itemId, user.getId())
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));

        itemRepository.delete(item);
    }

    /**
     * Alterna o estado de equipamento de um item (Equipado <-> Desequipado). Valida ownership.
     */
    @Override
    public ItemDTO toggleEquip(String itemId, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        ItemModel item = itemRepository.findByIdAndCharacter_FromUserId(itemId, user.getId())
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));

        item.setIsEquipped(!Boolean.TRUE.equals(item.getIsEquipped()));
        ItemModel saved = itemRepository.save(item);
        return convertToDTO(saved);
    }

    /**
     * Método auxiliar para converter uma entidade ItemModel em ItemDTO.
     * * @param item A entidade a ser convertida.
     * @return O objeto de transferência de dados correspondente.
     */
    private ItemDTO convertToDTO(ItemModel item) {
        return new ItemDTO(item.getId(), item.getName(), item.getDescription(), item.getIsEquipped(), item.getTargetAttribute(), item.getEffectValue());
    }
}