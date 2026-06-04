package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.AtaqueInput;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attack;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdicionarAtaqueUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Attack execute(String characterId, String userId, AtaqueInput input) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));
        Attack attack = character.addAttack(input.name(), input.damageDice(), input.description());
        characterRepository.salvar(character);
        return attack;
    }
}
