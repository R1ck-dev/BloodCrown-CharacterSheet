package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.Models.AbilityModel;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.AbilityRepository;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.AbilityService;

@Service
public class AbilityServiceImpl implements AbilityService{

    private final AbilityRepository abilityRepository;
    private final CharacterRepository characterRepository;

    public AbilityServiceImpl(AbilityRepository abilityRepository, CharacterRepository characterRepository) {
        this.abilityRepository = abilityRepository;
        this.characterRepository = characterRepository;
    }

    @Override
    public AbilityDTO addAbility(String characterId, AbilityDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(characterId, user.getId())
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado."));

        AbilityModel ability = new AbilityModel();
        ability.setName(dto.name());
        ability.setCategory(dto.category());
        ability.setActionType(dto.actionType());

        ability.setMaxUses(dto.maxUses());
        ability.setCurrentUses(dto.maxUses());
        ability.setDiceRoll(dto.diceRoll());

        ability.setTargetAttribute(dto.targetAttribute());
        ability.setEffectValue(dto.effectValue());
        ability.setDurationDice(dto.durationDice());

        ability.setIsActive(false);
        ability.setTurnsRemaining(0);

        ability.setDescription(dto.description());
        ability.setCharacter(charModel);

        AbilityModel saved = abilityRepository.save(ability);

        return new AbilityDTO(
            saved.getId(),
            saved.getName(),
            saved.getCategory(),
            saved.getActionType(),
            saved.getMaxUses(),
            saved.getCurrentUses(),
            saved.getDiceRoll(),
            saved.getTargetAttribute(),
            saved.getEffectValue(),
            saved.getDurationDice(),
            saved.getIsActive(),
            saved.getTurnsRemaining(),
            saved.getDescription()
        );
    }
    
}
