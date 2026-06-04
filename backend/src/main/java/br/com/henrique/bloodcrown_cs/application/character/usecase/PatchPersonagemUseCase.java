package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.PatchPersonagemInput;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatchPersonagemUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Character execute(String characterId, String userId, PatchPersonagemInput input) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Ficha não encontrada ou permissão negada."));
        character.applyPatch(
            input.name(), input.characterClass(), input.level(), input.money(),
            input.heroPoint(), input.biography(), input.attributes(), input.status(),
            input.expertise(), input.actionPool());
        return characterRepository.salvar(character);
    }
}
