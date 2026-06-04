package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.ItemInput;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.Item;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtualizarItemUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Item execute(String itemId, String userId, ItemInput input) {
        Character character = characterRepository.buscarPorItemIdEUsuario(itemId, userId)
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
        Item item = character.updateItem(itemId, input.name(), input.description(), input.targetAttribute(),
                input.effectValue(), input.quantity(), input.useDice());
        characterRepository.salvar(character);
        return item;
    }
}
