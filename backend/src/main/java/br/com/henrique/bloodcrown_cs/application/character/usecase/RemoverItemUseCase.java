package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemoverItemUseCase {

    private final CharacterRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void execute(String itemId, String userId) {
        Character character = characterRepository.buscarPorItemIdEUsuario(itemId, userId)
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
        character.removeItem(itemId);
        characterRepository.salvar(character);
        // Remover um item equipado tira o buff de defesa/resistência — avisa o tabuleiro.
        eventPublisher.publishEvent(new FichaStatusAlteradaEvent(character.getId()));
    }
}
