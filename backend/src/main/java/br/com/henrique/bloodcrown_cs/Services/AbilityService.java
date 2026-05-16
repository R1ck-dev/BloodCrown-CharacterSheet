package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;

/**
 * Interface que gerencia a lógica complexa de habilidades e magias.
 * Controla adição, remoção, tempos de recarga (cooldowns) e consumo de recursos.
 */
public interface AbilityService {

    /**
     * Adiciona uma nova habilidade ao personagem.
     * * @param characterId Identificador do personagem.
     * @param dto Dados da habilidade.
     * @param authentication Objeto de autenticação.
     * @return A habilidade persistida.
     */
    AbilityDTO addAbility(String characterId, AbilityDTO dto, Authentication authentication);

    /**
     * Remove uma habilidade da ficha. Valida que a habilidade pertence ao usuário autenticado.
     */
    void deleteAbility(String abilityId, Authentication authentication);

    /**
     * Ativa ou desativa uma habilidade (ex: posturas ou buffs sustentados).
     * Valida que a habilidade pertence ao usuário autenticado.
     */
    AbilityDTO toggleAbility(String abilityId, Authentication authentication);

    /**
     * Processa o avanço de turno para um personagem. Valida que o personagem pertence ao usuário autenticado.
     */
    void advanceTurn(String characterId, Authentication authentication);

    /**
     * Gerencia o uso e recuperação de cargas de uma habilidade. Valida ownership.
     */
    AbilityDTO recoverUse(String abilityId, String resourceToSpend, Authentication authentication);
}