package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.enums.ActionType;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Alterna a ativação de uma habilidade. Retorna a ficha completa (o controller
 * monta o sheet) pra o front sincronizar pool/usos sem GET extra.
 */
@Service
@RequiredArgsConstructor
public class AlternarHabilidadeUseCase {

    private final CharacterRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Character execute(String abilityId, String userId, ActionType spendAs) {
        Character character = characterRepository.buscarPorHabilidadeIdEUsuario(abilityId, userId)
                .orElseThrow(() -> new NotFoundException("Habilidade não encontrada."));
        character.toggleAbility(abilityId, spendAs);
        Character salvo = characterRepository.salvar(character);
        // Buff de defesa/resistência muda — avisa o tabuleiro (após commit) pra o token atualizar ao vivo.
        eventPublisher.publishEvent(new FichaStatusAlteradaEvent(salvo.getId()));
        return salvo;
    }
}
