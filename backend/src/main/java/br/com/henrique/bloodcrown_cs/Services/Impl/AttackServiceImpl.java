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

/**
 * Implementação da lógica de negócios para ataques e armas.
 * Garante que apenas o proprietário do personagem possa adicionar ou modificar ataques.
 */
@Service
public class AttackServiceImpl implements AttackService{

    private final CharacterRepository characterRepository;
    private final AttackRepository attackRepository;

    public AttackServiceImpl(CharacterRepository characterRepository, AttackRepository attackRepository) {
        this.characterRepository = characterRepository;
        this.attackRepository = attackRepository;
    }

//--------------------------------Adiciona Ataques--------------------------------

    /**
     * Cria e associa um novo ataque a um personagem.
     * Realiza uma verificação de segurança buscando o personagem pelo ID e pelo ID do Usuário logado,
     * garantindo que um usuário não altere a ficha de outro.
     * * @param characterId Identificador do personagem.
     * @param dto Dados do ataque (nome, dano, descrição).
     * @param authentication Contexto de segurança do usuário atual.
     * @return O DTO do ataque salvo.
     */
    @Override
    public AttackDTO addAttack(String characterId, AttackDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(characterId, user.getId())
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado."));

        AttackModel attack = new AttackModel();
        attack.setName(dto.name());
        attack.setDamageDice(dto.damageDice());
        attack.setDescription(dto.description());
        attack.setCharacter(charModel);

        AttackModel savedAttack = attackRepository.save(attack);

        return new AttackDTO(
            savedAttack.getId(),
            savedAttack.getName(),
            savedAttack.getDamageDice(),
            savedAttack.getDescription()
        );

    }

//--------------------------------------------------------------------------------
//--------------------------------Deletar Ataques--------------------------------

    /**
     * Remove um ataque do banco de dados pelo seu ID.
     * * @param attackId Identificador do ataque.
     */
    @Override
    public void deleteAttack(String attackId) {
        attackRepository.deleteById(attackId);
    }
    
}