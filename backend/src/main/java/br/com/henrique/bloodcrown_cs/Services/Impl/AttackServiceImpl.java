package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;
import br.com.henrique.bloodcrown_cs.Exceptions.NotFoundException;
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
                .orElseThrow(() -> new NotFoundException("Personagem não encontrado."));

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
//--------------------------------Atualizar Ataques-------------------------------

    /**
     * Atualiza um ataque existente (nome, fórmula de dano, descrição). Valida ownership.
     */
    @Override
    public AttackDTO updateAttack(String attackId, AttackDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        AttackModel attack = attackRepository.findByIdAndCharacter_FromUserId(attackId, user.getId())
                .orElseThrow(() -> new NotFoundException("Ataque não encontrado."));

        attack.setName(dto.name());
        attack.setDamageDice(dto.damageDice());
        attack.setDescription(dto.description());

        AttackModel saved = attackRepository.save(attack);
        return new AttackDTO(saved.getId(), saved.getName(), saved.getDamageDice(), saved.getDescription());
    }

//--------------------------------------------------------------------------------
//--------------------------------Deletar Ataques--------------------------------

    /**
     * Remove um ataque do banco de dados pelo seu ID. Valida ownership.
     */
    @Override
    public void deleteAttack(String attackId, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        AttackModel attack = attackRepository.findByIdAndCharacter_FromUserId(attackId, user.getId())
                .orElseThrow(() -> new NotFoundException("Ataque não encontrado."));

        attackRepository.delete(attack);
    }

}