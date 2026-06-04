package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Alterna o estado equipado de um item. Retorna a ficha completa pra refletir
 * bônus/maluses derivados sem GET extra.
 */
@Service
@RequiredArgsConstructor
public class AlternarEquipamentoItemUseCase {

    private final CharacterRepository characterRepository;

    @Transactional
    public Character execute(String itemId, String userId) {
        Character character = characterRepository.buscarPorItemIdEUsuario(itemId, userId)
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
        character.toggleItemEquip(itemId);
        return characterRepository.salvar(character);
    }
}
