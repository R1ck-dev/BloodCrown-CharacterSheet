package br.com.henrique.bloodcrown_cs.application.character.usecase;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.character.dto.EffectInput;
import br.com.henrique.bloodcrown_cs.application.character.dto.HabilidadeInput;
import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.model.Ability;
import br.com.henrique.bloodcrown_cs.domain.character.model.AbilityEffect;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtualizarHabilidadeUseCase {

    private final CharacterRepository characterRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Ability execute(String abilityId, String userId, HabilidadeInput input) {
        Character character = characterRepository.buscarPorHabilidadeIdEUsuario(abilityId, userId)
                .orElseThrow(() -> new NotFoundException("Habilidade não encontrada."));

        Ability draft = montarRascunho(input);
        Ability updated = character.updateAbility(abilityId, draft);
        characterRepository.salvar(character);
        // Se a habilidade estava ativa, editar effects muda defesa/resistência — avisa o tabuleiro.
        eventPublisher.publishEvent(new FichaStatusAlteradaEvent(character.getId()));
        return updated;
    }

    private Ability montarRascunho(HabilidadeInput input) {
        Ability draft = Ability.create();
        draft.setName(input.name());
        draft.setCategory(input.category());
        draft.setResourceType(input.resourceType());
        draft.setActionType(input.actionType());
        draft.setMaxUses(input.maxUses());
        draft.setDiceRoll(input.diceRoll());
        draft.setDurationDice(input.durationDice());
        draft.setDescription(input.description());
        if (input.effects() != null) {
            List<AbilityEffect> effects = new ArrayList<>();
            for (EffectInput e : input.effects()) {
                effects.add(AbilityEffect.create(e.target(), e.value()));
            }
            draft.setEffects(effects);
        }
        return draft;
    }
}
