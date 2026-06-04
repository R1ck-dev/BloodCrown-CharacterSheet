package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuscarPersonagemUseCase {

    private final CharacterRepository characterRepository;

    /**
     * Carrega a ficha completa validando posse. Faz backfill do actionPool (fichas
     * pré-feature) e persiste — mesmo comportamento do antigo getCharacterById.
     */
    @Transactional
    public Character execute(String characterId, String userId) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Ficha não encontrada ou permissão negada."));
        character.ensureActionPool();
        return characterRepository.salvar(character);
    }
}
