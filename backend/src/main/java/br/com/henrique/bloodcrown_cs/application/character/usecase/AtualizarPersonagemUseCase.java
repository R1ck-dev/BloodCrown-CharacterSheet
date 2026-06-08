package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.AtualizarPersonagemInput;
import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtualizarPersonagemUseCase {

    private final CharacterRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Character execute(String characterId, String userId, AtualizarPersonagemInput input) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Ficha não encontrada ou permissão negada."));
        character.applyFullUpdate(
            input.name(), input.characterClass(), input.level(), input.money(),
            input.heroPoint(), input.biography(), input.attributes(), input.status(),
            input.expertise(), input.actionPool());
        Character salvo = characterRepository.salvar(character);
        // Avisa o tabuleiro (após commit) — barras dos tokens vinculados atualizam ao vivo.
        eventPublisher.publishEvent(new FichaStatusAlteradaEvent(characterId));
        return salvo;
    }
}
