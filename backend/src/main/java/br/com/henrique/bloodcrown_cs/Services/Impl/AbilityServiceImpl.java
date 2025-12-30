package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.DTOs.EffectDTO;
import br.com.henrique.bloodcrown_cs.Models.AbilityEffectModel;
import br.com.henrique.bloodcrown_cs.Models.AbilityModel;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.ItemModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.AbilityRepository;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.AbilityService;

@Service
public class AbilityServiceImpl implements AbilityService {

    private final AbilityRepository abilityRepository;
    private final CharacterRepository characterRepository;

    public AbilityServiceImpl(AbilityRepository abilityRepository, CharacterRepository characterRepository) {
        this.abilityRepository = abilityRepository;
        this.characterRepository = characterRepository;
    }

private AbilityDTO convertToDTO(AbilityModel ab) {
        List<EffectDTO> effectsDto = new ArrayList<>();
        
        if (ab.getEffects() != null) {
            effectsDto = ab.getEffects().stream()
                .map(e -> new EffectDTO(e.getTargetAttribute(), e.getEffectValue()))
                .toList();
        }

        return new AbilityDTO(
            ab.getId(), 
            ab.getName(), 
            ab.getCategory(), 
            ab.getResourceType(), 
            ab.getActionType(),
            ab.getMaxUses(), 
            ab.getCurrentUses(), 
            ab.getDiceRoll(),
            effectsDto, 
            ab.getDurationDice(), 
            ab.getIsActive(), 
            ab.getTurnsRemaining(), 
            ab.getDescription()
        );
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
        ability.setDurationDice(dto.durationDice());
        ability.setIsActive(false);
        ability.setTurnsRemaining(0);
        ability.setDescription(dto.description());
        ability.setResourceType(dto.resourceType());
        ability.setCharacter(charModel);

        // --- LÓGICA DE EFEITOS (LISTA) ---
        if (dto.effects() != null && !dto.effects().isEmpty()) {
            List<AbilityEffectModel> effectsList = new ArrayList<>();
            for (EffectDTO effDto : dto.effects()) {
                AbilityEffectModel effect = new AbilityEffectModel();
                effect.setTargetAttribute(effDto.target());
                effect.setEffectValue(effDto.value());
                effect.setAbility(ability); // Vínculo Bidirecional
                effectsList.add(effect);
            }
            ability.setEffects(effectsList);
        }

        AbilityModel saved = abilityRepository.save(ability);
        return convertToDTO(saved);
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
            if (ability.getCurrentUses() == null || ability.getCurrentUses() <= 0) {
                throw new RuntimeException("Sem usos disponíveis para ativar esta habilidade!");
            }

            ability.setCurrentUses(ability.getCurrentUses() - 1);

            ability.setIsActive(true);
            if (ability.getDurationDice() != null && !ability.getDurationDice().isBlank()) {
                int turns = rollDice(ability.getDurationDice());
                ability.setTurnsRemaining(turns);
            } else {
                ability.setTurnsRemaining(null);
            }
            
        } else {
            ability.setIsActive(false);
            ability.setTurnsRemaining(0);
        }

        AbilityModel saved = abilityRepository.save(ability);

        return convertToDTO(saved);
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
//----------------------------------------------------------------------------------

    @Override
    public AbilityDTO recoverUse(String abilityId, String resourceToSpend) {
        AbilityModel ability = abilityRepository.findById(abilityId)
            .orElseThrow(() -> new RuntimeException("Habilidade não encontrada."));

        CharacterModel character = ability.getCharacter();

        if (ability.getCurrentUses() >= ability.getMaxUses()) {
            throw new RuntimeException("Os usos já estão cheios!");
        }

        boolean spendMana = false;
        boolean spendStamina = false;

        switch (ability.getResourceType()) {
            case MANA -> spendMana = true;
            case STAMINA -> spendStamina = true;
            case HYBRID -> {
                if ("MANA".equalsIgnoreCase(resourceToSpend)) spendMana = true;
                else if ("STAMINA".equalsIgnoreCase(resourceToSpend)) spendStamina = true;
                else throw new RuntimeException("Para habilidades híbridas, especifique MANA Ou STAMINA.");
            }
        }

        int reduction = 0;

        if (character.getInventory() != null) {
            for (ItemModel item : character.getInventory()) {
                if (Boolean.TRUE.equals(item.getIsEquipped())) {
                    if ("REDUCE_MANA".equals(item.getTargetAttribute()) && spendMana) {
                        reduction += (item.getEffectValue() != null ? item.getEffectValue() : 0);
                    }
                    if ("REDUCE_STAMINA".equals(item.getTargetAttribute()) && spendStamina) {
                        reduction += (item.getEffectValue() != null ? item.getEffectValue() : 0);
                    }
                }
            }
        }

        int COST = Math.max(0, 50 - reduction);

        if (spendMana) {
            if (character.getStatus().getCurrentMana() < COST) {
                throw new RuntimeException("Mana insuficiente!");
            }
            character.getStatus().setCurrentMana(character.getStatus().getCurrentMana() - COST);
        } else if (spendStamina) {
            if (character.getStatus().getCurrentStamina() < COST) {
                throw new RuntimeException("Estamina Insuficiente!");
            }
            character.getStatus().setCurrentStamina(character.getStatus().getCurrentStamina() - COST);
        }

        ability.setCurrentUses(ability.getCurrentUses() + 1);

        characterRepository.save(character);
        AbilityModel saved = abilityRepository.save(ability);

        return convertToDTO(saved);
    }
}
