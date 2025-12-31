package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Controlador responsável por gerenciar as requisições HTTP relacionadas às fichas de personagem.
 * Expõe endpoints para criação, leitura, atualização e exclusão (CRUD), além de ações específicas de jogo.
 */
@RestController
@RequestMapping("/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }
    
    /**
     * Recupera a lista resumida de personagens pertencentes ao usuário autenticado.
     * * @param authentication Objeto contendo os dados do usuário logado.
     * @return ResponseEntity contendo a lista de CharacterDTO.
     */
    @GetMapping
    public ResponseEntity<List<CharacterDTO>> getUserCharacters(Authentication authentication) {
        List<CharacterDTO> response = characterService.getUserCharacters(authentication);

        return ResponseEntity.ok(response);
    }

    /**
     * Cria um novo personagem vinculado ao usuário autenticado.
     * Gera a URI do novo recurso criado no cabeçalho da resposta.
     * * @param authentication Objeto contendo os dados do usuário logado.
     * @return ResponseEntity com o status 201 (Created) e o DTO do personagem criado.
     */
    @PostMapping
    public ResponseEntity<CharacterDTO> createCharacter(Authentication authentication) {
        CharacterDTO newChar = characterService.createCharacter(authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newChar.id()).toUri();

        return ResponseEntity.created(location).body(newChar);
    }
    
    /**
     * Busca os detalhes completos de uma ficha de personagem específica pelo ID.
     * Valida se o personagem pertence ao usuário autenticado.
     * * @param id Identificador único do personagem.
     * @param authentication Objeto contendo os dados do usuário logado.
     * @return ResponseEntity contendo os dados detalhados da ficha (CharacterSheetDTO).
     */
    @GetMapping("/{id}")
    public ResponseEntity<CharacterSheetDTO> getCharacterById(@PathVariable String id, Authentication authentication) {
        CharacterSheetDTO character = characterService.getCharacterById(id, authentication);
        return ResponseEntity.ok(character);
    }
    
    /**
     * Atualiza as informações de um personagem existente.
     * * @param id Identificador do personagem a ser atualizado.
     * @param characterSheetDTO Objeto contendo os novos dados da ficha.
     * @param authentication Objeto contendo os dados do usuário logado para validação de posse.
     * @return ResponseEntity com os dados atualizados do personagem.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CharacterSheetDTO> updateCharacter(@PathVariable String id, @RequestBody CharacterSheetDTO characterSheetDTO, Authentication authentication) {
        CharacterSheetDTO updatedCharacter = characterService.updateCharacter(id, characterSheetDTO, authentication);
        return ResponseEntity.ok(updatedCharacter);
    }

    /**
     * Remove permanentemente um personagem do sistema.
     * * @param id Identificador do personagem a ser excluído.
     * @param authentication Objeto contendo os dados do usuário logado.
     * @return ResponseEntity com status 204 (No Content) indicando sucesso sem corpo de resposta.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable String id, Authentication authentication) {
        characterService.deleteCharacter(id, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * Executa a ação de "Descanso" para o personagem, recuperando recursos como Vida e Mana
     * de acordo com as regras de negócio definidas no serviço.
     * * @param id Identificador do personagem.
     * @param authentication Objeto contendo os dados do usuário logado.
     * @return ResponseEntity com status 200 (OK).
     */
    @PostMapping("/{id}/rest")
    public ResponseEntity<Void> restCharacter(@PathVariable String id, Authentication authentication) {
        characterService.restCharacter(id, authentication);
        return ResponseEntity.ok().build();
    }
}