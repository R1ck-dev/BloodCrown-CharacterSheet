package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.CustomSkillDTO;

/**
 * Contrato para gerenciamento de perícias personalizadas (coleção dinâmica do personagem).
 * Mesmo formato de {@link AttackService}: add/update/delete com validação de posse.
 */
public interface CustomSkillService {

    /**
     * Adiciona uma nova perícia personalizada ao personagem. Valida que o personagem
     * pertence ao usuário autenticado.
     */
    CustomSkillDTO addCustomSkill(String characterId, CustomSkillDTO dto, Authentication authentication);

    /**
     * Atualiza nome/atributo/valor de uma perícia existente. Valida ownership.
     */
    CustomSkillDTO updateCustomSkill(String customSkillId, CustomSkillDTO dto, Authentication authentication);

    /**
     * Remove uma perícia personalizada. Valida ownership.
     */
    void deleteCustomSkill(String customSkillId, Authentication authentication);
}
