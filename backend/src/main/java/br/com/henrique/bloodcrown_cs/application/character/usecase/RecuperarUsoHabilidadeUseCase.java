package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Recupera 1 uso de uma habilidade gastando recurso. Retorna a ficha completa
 * pra refletir o gasto sem GET extra.
 */
@Service
@RequiredArgsConstructor
public class RecuperarUsoHabilidadeUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Character execute(String abilityId, String userId, String resource) {
        Character character = characterRepository.buscarPorHabilidadeIdEUsuario(abilityId, userId)
                .orElseThrow(() -> new NotFoundException("Habilidade não encontrada."));
        character.recoverAbilityUse(abilityId, resource);
        return characterRepository.salvar(character);
    }
}
