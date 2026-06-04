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
public class AtualizarAtaqueUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Attack execute(String attackId, String userId, AtaqueInput input) {
        Character character = characterRepository.buscarPorAtaqueIdEUsuario(attackId, userId)
                .orElseThrow(() -> new NotFoundException("Ataque não encontrado."));
        Attack attack = character.updateAttack(attackId, input.name(), input.damageDice(), input.description());
        characterRepository.salvar(character);
        return attack;
    }
}
