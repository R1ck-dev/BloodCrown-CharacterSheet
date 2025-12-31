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
     * Remove uma habilidade da ficha.
     * * @param attackId Identificador da habilidade (nota: o nome do parâmetro sugere attackId, mas refere-se à habilidade).
     */
    void deleteAbility(String attackId);

    /**
     * Ativa ou desativa uma habilidade (ex: posturas ou buffs sustentados).
     * * @param abilityDTO ID da habilidade (recebido como string).
     * @return A habilidade com o estado atualizado.
     */
    AbilityDTO toggleAbility(String abilityDTO);

    /**
     * Processa o avanço de turno para um personagem.
     * Responsável por reduzir os contadores de "cooldown" (tempo de recarga) de todas as habilidades ativas.
     * * @param characterId Identificador do personagem.
     */
    void advanceTurn(String characterId);

    /**
     * Gerencia o uso e recuperação de cargas de uma habilidade.
     * Pode consumir recursos (Mana/Estamina) para recuperar usos ou recarregar slots.
     * * @param abilityId Identificador da habilidade.
     * @param resourceToSpend Tipo de recurso a ser gasto na operação (opcional).
     * @return A habilidade com os contadores de uso atualizados.
     */
    AbilityDTO recoverUse(String abilityId, String resourceToSpend);
}