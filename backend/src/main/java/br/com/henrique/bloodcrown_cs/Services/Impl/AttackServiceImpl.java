package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;
import br.com.henrique.bloodcrown_cs.Models.AttackModel;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.AttackRepository;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.AttackService;

@Service
public class AttackServiceImpl implements AttackService{

    private final CharacterRepository characterRepository;
    private final AttackRepository attackRepository;

    public AttackServiceImpl(CharacterRepository characterRepository, AttackRepository attackRepository) {
        this.characterRepository = characterRepository;
        this.attackRepository = attackRepository;
    }

//--------------------------------Adiciona Ataques--------------------------------

    @Override
    public AttackDTO addAttack(String characterId, AttackDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(characterId, user.getId())
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado."));

        AttackModel attack = new AttackModel();
        attack.setName(dto.name());
        attack.setTestDice(dto.testDice());
        attack.setDamageDice(dto.damageDice());
        attack.setDescription(dto.description());
        attack.setCharacter(charModel);

        AttackModel savedAttack = attackRepository.save(attack);

        return new AttackDTO(
            savedAttack.getId(),
            savedAttack.getName(),
            savedAttack.getTestDice(),
            savedAttack.getDamageDice(),
            savedAttack.getDescription()
        );

    }

//--------------------------------------------------------------------------------
//--------------------------------Deletar Ataques--------------------------------

    @Override
    public void deleteAttack(String attackId) {
        attackRepository.deleteById(attackId);
    }
    
}
