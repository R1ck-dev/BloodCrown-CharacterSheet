package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemoverAtaqueUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public void execute(String attackId, String userId) {
        Character character = characterRepository.buscarPorAtaqueIdEUsuario(attackId, userId)
                .orElseThrow(() -> new NotFoundException("Ataque não encontrado."));
        character.removeAttack(attackId);
        characterRepository.salvar(character);
    }
}
