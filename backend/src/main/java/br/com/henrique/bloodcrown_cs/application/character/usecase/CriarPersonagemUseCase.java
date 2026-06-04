package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CriarPersonagemUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Character execute(String userId) {
        Character character = Character.createNew(userId);
        return characterRepository.salvar(character);
    }
}
