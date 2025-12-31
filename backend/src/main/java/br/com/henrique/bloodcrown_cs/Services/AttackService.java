package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;

/**
 * Interface que define o contrato para gerenciamento de ataques e armas.
 */
public interface AttackService {

    /**
     * Adiciona um novo ataque ou arma à lista de combate do personagem.
     * * @param characterId Identificador do personagem.
     * @param dto Dados do ataque (nome, dano, descrição).
     * @param authentication Objeto de autenticação para validação de segurança.
     * @return O ataque criado.
     */
    AttackDTO addAttack(String characterId, AttackDTO dto, Authentication authentication);

    /**
     * Remove um ataque da ficha do personagem.
     * * @param attackId Identificador do ataque a ser removido.
     */
    void deleteAttack(String attackId);
}