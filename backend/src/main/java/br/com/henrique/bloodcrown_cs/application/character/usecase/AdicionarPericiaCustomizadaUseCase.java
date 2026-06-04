package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.CustomSkillInput;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.CustomSkill;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdicionarPericiaCustomizadaUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public CustomSkill execute(String characterId, String userId, CustomSkillInput input) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));
        CustomSkill skill = character.addCustomSkill(input.name(), input.attribute(), input.value());
        characterRepository.salvar(character);
        return skill;
    }
}
