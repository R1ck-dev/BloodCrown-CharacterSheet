package br.com.henrique.bloodcrown_cs.application.character.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListarPersonagensUseCase {

    private final CharacterRepository characterRepository;

    @Transactional(readOnly = true)
    public List<Character> execute(String userId) {
        return characterRepository.buscarPorUsuario(userId);
    }
}
