package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.ItemInput;
import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.Item;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtualizarItemUseCase {

    private final CharacterRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Item execute(String itemId, String userId, ItemInput input) {
        Character character = characterRepository.buscarPorItemIdEUsuario(itemId, userId)
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
        Item item = character.updateItem(itemId, input.name(), input.description(), input.targetAttribute(),
                input.effectValue(), input.quantity(), input.useDice());
        characterRepository.salvar(character);
        // Item equipado editado pode mudar defesa/resistência (ou vida via poção) — avisa o tabuleiro.
        eventPublisher.publishEvent(new FichaStatusAlteradaEvent(character.getId()));
        return item;
    }
}
