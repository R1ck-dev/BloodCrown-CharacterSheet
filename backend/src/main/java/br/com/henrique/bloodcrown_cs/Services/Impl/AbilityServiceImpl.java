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

//--------------------------------Adiciona Habilidade--------------------------------

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
//-----------------------------------------------------------------------------------
//--------------------------------Deletando Habilidade--------------------------------

    @Override
    public void deleteAbility(String abilityId) {
        abilityRepository.deleteById(abilityId);
    }
//-----------------------------------------------------------------------------------
//--------------------------------Ligando Habilidade--------------------------------

@Override
    public AbilityDTO toggleAbility(String abilityId) {
        AbilityModel ability = abilityRepository.findById(abilityId)
                .orElseThrow(() -> new RuntimeException("Habilidade não encontrada."));

        boolean isActivating = !Boolean.TRUE.equals(ability.getIsActive());
        ability.setIsActive(isActivating);

        if (isActivating) {
            if (ability.getDurationDice() != null && !ability.getDurationDice().isBlank()) {
                int turns = rollDice(ability.getDurationDice());
                ability.setTurnsRemaining(turns);
            } else {
                ability.setTurnsRemaining(null); 
            }
            
        } else {
            ability.setTurnsRemaining(0);
        }

        AbilityModel saved = abilityRepository.save(ability);
        
        return new AbilityDTO(
            saved.getId(), saved.getName(), saved.getCategory(), saved.getActionType(),
            saved.getMaxUses(), saved.getCurrentUses(), saved.getDiceRoll(),
            saved.getTargetAttribute(), saved.getEffectValue(),
            saved.getDurationDice(), saved.getIsActive(), saved.getTurnsRemaining(),
            saved.getDescription()
        );
    }

    private int rollDice(String formula) {
        try {
            String clean = formula.toLowerCase().replace(" ", "");
            
            if (clean.matches("\\d+")) return Integer.parseInt(clean);

            if (clean.contains("d")) {
                String[] parts = clean.split("[d\\+\\-]"); 
                int count = Integer.parseInt(parts[0]);
                int faces = Integer.parseInt(parts[1]);
                
                int total = 0;
                for (int i = 0; i < count; i++) {
                    total += (int) (Math.random() * faces) + 1;
                }
                
                if (clean.contains("+")) {
                    String bonusStr = clean.substring(clean.indexOf("+") + 1);
                    total += Integer.parseInt(bonusStr);
                }
                
                return total;
            }
            return 0; 
        } catch (Exception e) {
            System.err.println("Erro ao rolar duração: " + formula);
            return 1; 
        }
    }
//----------------------------------------------------------------------------------
//--------------------------------Passando Turno--------------------------------
@Override
    public void advanceTurn(String characterId) {
        CharacterModel charModel = characterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado."));

        for (AbilityModel ability : charModel.getAbilities()) {
            
            if (Boolean.TRUE.equals(ability.getIsActive())) {
                
                if (ability.getTurnsRemaining() != null && ability.getTurnsRemaining() > 0) {
                    
                    int newValue = ability.getTurnsRemaining() - 1;
                    ability.setTurnsRemaining(newValue);

                    if (newValue <= 0) {
                        ability.setIsActive(false);
                        ability.setTurnsRemaining(0);
                    }
                    
                    abilityRepository.save(ability);
                }
            }
        }
    }
}
