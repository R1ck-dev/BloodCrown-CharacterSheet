package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.ItemModel;
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
     * Busca o personagem no banco de dados, cria uma nova entidade de item,
     * preenche com os dados do DTO e persiste a relação.
     * * @param characterId ID do personagem proprietário.
     * @param dto Dados do novo item.
     * @return O DTO do item persistido.
     */
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

    /**
     * Remove um item do banco de dados através do seu ID.
     * * @param itemId Identificador do item a ser excluído.
     */
    @Override
    public void deleteItem(String itemId) {
        itemRepository.deleteById(itemId);
    }

    /**
     * Alterna o estado de equipamento de um item (Equipado <-> Desequipado).
     * Recupera o item, inverte o valor booleano atual e salva a alteração.
     * * @param itemId Identificador do item.
     * @return O DTO do item com o estado atualizado.
     */
    @Override
    public ItemDTO toggleEquip(String itemId) {
        ItemModel item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        
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