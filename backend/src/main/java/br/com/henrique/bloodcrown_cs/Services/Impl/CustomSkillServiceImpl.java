package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.CustomSkillDTO;
import br.com.henrique.bloodcrown_cs.Exceptions.NotFoundException;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.CustomSkillModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Repositories.CustomSkillRepository;
import br.com.henrique.bloodcrown_cs.Services.CustomSkillService;

/**
 * Implementação das regras de perícias personalizadas. Garante que só o dono do
 * personagem cria/edita/remove suas perícias — mesma validação de posse de
 * {@link AttackServiceImpl}.
 */
@Service
public class CustomSkillServiceImpl implements CustomSkillService {

    private final CharacterRepository characterRepository;
    private final CustomSkillRepository customSkillRepository;

    public CustomSkillServiceImpl(CharacterRepository characterRepository, CustomSkillRepository customSkillRepository) {
        this.characterRepository = characterRepository;
        this.customSkillRepository = customSkillRepository;
    }

    @Override
    public CustomSkillDTO addCustomSkill(String characterId, CustomSkillDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(characterId, user.getId())
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));

        CustomSkillModel skill = new CustomSkillModel();
        skill.setName(dto.name());
        skill.setAttribute(dto.attribute());
        skill.setValue(dto.value());
        skill.setCharacter(charModel);

        CustomSkillModel saved = customSkillRepository.save(skill);
        return toDto(saved);
    }

    @Override
    public CustomSkillDTO updateCustomSkill(String customSkillId, CustomSkillDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CustomSkillModel skill = customSkillRepository.findByIdAndCharacter_FromUserId(customSkillId, user.getId())
                .orElseThrow(() -> new NotFoundException("Perícia não encontrada."));

        skill.setName(dto.name());
        skill.setAttribute(dto.attribute());
        skill.setValue(dto.value());

        CustomSkillModel saved = customSkillRepository.save(skill);
        return toDto(saved);
    }

    @Override
    public void deleteCustomSkill(String customSkillId, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CustomSkillModel skill = customSkillRepository.findByIdAndCharacter_FromUserId(customSkillId, user.getId())
                .orElseThrow(() -> new NotFoundException("Perícia não encontrada."));

        customSkillRepository.delete(skill);
    }

    private CustomSkillDTO toDto(CustomSkillModel skill) {
        return new CustomSkillDTO(skill.getId(), skill.getName(), skill.getAttribute(), skill.getValue());
    }
}
