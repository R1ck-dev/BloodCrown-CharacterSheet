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
public class AdicionarItemUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Item execute(String characterId, String userId, ItemInput input) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));
        Item item = character.addItem(input.name(), input.description(), input.targetAttribute(),
                input.effectValue(), input.quantity(), input.useDice());
        characterRepository.salvar(character);
        return item;
    }
}
