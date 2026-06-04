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
public class AtualizarPericiaCustomizadaUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public CustomSkill execute(String customSkillId, String userId, CustomSkillInput input) {
        Character character = characterRepository.buscarPorPericiaCustomizadaIdEUsuario(customSkillId, userId)
                .orElseThrow(() -> new NotFoundException("Perícia não encontrada."));
        CustomSkill skill = character.updateCustomSkill(customSkillId, input.name(), input.attribute(), input.value());
        characterRepository.salvar(character);
        return skill;
    }
}
