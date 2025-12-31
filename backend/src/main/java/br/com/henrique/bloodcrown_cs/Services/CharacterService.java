package br.com.henrique.bloodcrown_cs.Services;

import java.util.List;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;

/**
 * Interface que define o contrato para as operações de negócio relacionadas aos Personagens.
 * Gerencia o ciclo de vida das fichas (CRUD) e ações de jogabilidade como descanso.
 */
public interface CharacterService {

    /**
     * Recupera uma lista resumida de todos os personagens pertencentes ao usuário autenticado.
     * * @param authentication Objeto contendo as credenciais do usuário atual.
     * @return Lista de DTOs simplificados para exibição em menus ou dashboards.
     */
    List<CharacterDTO> getUserCharacters(Authentication authentication);

    /**
     * Inicializa e persiste um novo personagem para o usuário autenticado.
     * Cria a estrutura base da ficha com valores padrão.
     * * @param authentication Objeto contendo as credenciais do usuário atual.
     * @return O DTO resumido do personagem recém-criado.
     */
    CharacterDTO createCharacter(Authentication authentication);

    /**
     * Busca os detalhes completos de uma ficha específica.
     * Deve validar se o personagem pertence ao usuário solicitante.
     * * @param id Identificador do personagem.
     * @param authentication Objeto contendo as credenciais do usuário atual.
     * @return O DTO completo com atributos, inventário, habilidades, etc.
     */
    CharacterSheetDTO getCharacterById(String id, Authentication authentication); 

    /**
     * Atualiza os dados de um personagem existente.
     * * @param id Identificador do personagem.
     * @param dto Objeto contendo os novos dados a serem salvos.
     * @param authentication Objeto contendo as credenciais do usuário atual.
     * @return O DTO atualizado da ficha completa.
     */
    CharacterSheetDTO updateCharacter(String id, CharacterSheetDTO dto, Authentication authentication);

    /**
     * Remove permanentemente um personagem do sistema.
     * * @param id Identificador do personagem.
     * @param authentication Objeto contendo as credenciais do usuário atual.
     */
    void deleteCharacter(String id, Authentication authentication);

    /**
     * Aplica a lógica de "Descanso Longo" ou "Descanso Curto".
     * Restaura Vida, Mana e Estamina para seus valores máximos.
     * * @param id Identificador do personagem.
     * @param authentication Objeto contendo as credenciais do usuário atual.
     */
    void restCharacter(String id, Authentication authentication);
}