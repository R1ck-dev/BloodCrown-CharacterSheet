package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.Enums.ActionTypeEnum;

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
     * Atualiza a definição de uma habilidade existente (nome, categoria, ação, descrição,
     * recurso, maxUses, fórmula, duração, efeitos). Preserva o estado runtime
     * (currentUses, isActive, turnsRemaining); se maxUses diminuir abaixo de currentUses,
     * faz cap em maxUses. Substitui a lista de efeitos por inteiro (orphanRemoval).
     */
    AbilityDTO updateAbility(String abilityId, AbilityDTO dto, Authentication authentication);

    /**
     * Remove uma habilidade da ficha. Valida que a habilidade pertence ao usuário autenticado.
     */
    void deleteAbility(String abilityId, Authentication authentication);

    /**
     * Ativa ou desativa uma habilidade. Quando ativando, consome 1 do pool de ações
     * correspondente. {@code spendAs} permite substituir o tipo padrão por um maior
     * (D&D-like): ex. gastar STANDARD pra cobrir uma habilidade BONUS.
     * Valida que a habilidade pertence ao usuário autenticado.
     * Retorna a ficha completa do personagem pra o front sincronizar o cache sem GET extra
     * (toggle muda actionPool e currentUses, recover muda status/mana/estamina).
     *
     * @param spendAs tipo de ação a debitar do pool; null = usa o actionType da habilidade.
     */
    CharacterSheetDTO toggleAbility(String abilityId, ActionTypeEnum spendAs, Authentication authentication);

    /**
     * Processa o avanço de turno para um personagem. Valida que o personagem pertence ao usuário autenticado.
     * Retorna a ficha completa pós-avanço (todas as abilities ativas + reset do pool).
     */
    CharacterSheetDTO advanceTurn(String characterId, Authentication authentication);

    /**
     * Gerencia o uso e recuperação de cargas de uma habilidade. Valida ownership.
     * Retorna a ficha completa pra refletir mudancas em currentMana/Stamina ao gastar recurso.
     */
    CharacterSheetDTO recoverUse(String abilityId, String resourceToSpend, Authentication authentication);
}