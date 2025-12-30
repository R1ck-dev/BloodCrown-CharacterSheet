package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;

public interface AbilityService {
    AbilityDTO addAbility(String characterId, AbilityDTO dto, Authentication authentication);
    void deleteAbility(String attackId);
    AbilityDTO toggleAbility(String abilityDTO);
    void advanceTurn(String characterId);
    AbilityDTO recoverUse(String abilityId, String resourceToSpend);
}
