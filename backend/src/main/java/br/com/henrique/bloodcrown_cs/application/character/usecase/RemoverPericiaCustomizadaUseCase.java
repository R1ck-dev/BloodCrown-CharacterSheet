package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemoverPericiaCustomizadaUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public void execute(String customSkillId, String userId) {
        Character character = characterRepository.buscarPorPericiaCustomizadaIdEUsuario(customSkillId, userId)
                .orElseThrow(() -> new NotFoundException("Perícia não encontrada."));
        character.removeCustomSkill(customSkillId);
        characterRepository.salvar(character);
    }
}
