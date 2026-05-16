package br.com.henrique.bloodcrown_cs.Controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.Enums.ActionTypeEnum;
import br.com.henrique.bloodcrown_cs.Services.AbilityService;

/**
 * Controlador responsável por gerenciar as habilidades (skills) dos personagens.
 * Controla adição, remoção, uso, recarga e avanço de turnos para cooldowns.
 */
@RestController
@RequestMapping("/abilities")
public class AbilityController {
    
    private final AbilityService abilityService;

    public AbilityController(AbilityService abilityService) {
        this.abilityService = abilityService;
    }

    /**
     * Adiciona uma nova habilidade à ficha do personagem.
     * * @param id Identificador do personagem.
     * @param abilityDTO Objeto contendo os dados da habilidade (nome, custo, cooldown, etc.).
     * @param authentication Objeto de autenticação.
     * @return ResponseEntity com status 201 (Created) e a habilidade criada.
     */
    @PostMapping("/{id}")
    public ResponseEntity<AbilityDTO> addAbility(@PathVariable String id, @RequestBody AbilityDTO abilityDTO, Authentication authentication) {
        AbilityDTO newAbility = abilityService.addAbility(id, abilityDTO, authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newAbility.id()).toUri();

        return ResponseEntity.created(location).body(newAbility);
    }

    /**
     * Atualiza a definição de uma habilidade existente.
     * Preserva estado runtime (currentUses, isActive, turnsRemaining) e substitui
     * a lista de efeitos por inteiro.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AbilityDTO> updateAbility(@PathVariable String id, @RequestBody AbilityDTO abilityDTO, Authentication authentication) {
        return ResponseEntity.ok(abilityService.updateAbility(id, abilityDTO, authentication));
    }

    /**
     * Remove uma habilidade da ficha do personagem.
     * * @param id Identificador da habilidade a ser removida.
     * @return ResponseEntity com status 204 (No Content).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbility(@PathVariable String id, Authentication authentication) {
        abilityService.deleteAbility(id, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * Alterna o estado de ativação de uma habilidade.
     * Query param opcional {@code spendAs} permite substituir o tipo de ação consumido
     * (D&D-like: gastar STANDARD pra cobrir uma BONUS, por exemplo).
     */
    @PostMapping("/{abilityId}/toggle")
    public ResponseEntity<AbilityDTO> toggleAbility(
        @PathVariable String abilityId,
        @RequestParam(required = false) ActionTypeEnum spendAs,
        Authentication authentication
    ) {
        return ResponseEntity.ok(abilityService.toggleAbility(abilityId, spendAs, authentication));
    }

    /**
     * Avança o turno para o personagem, reduzindo os tempos de recarga (cooldowns)
     * das habilidades ativas.
     */
    @PostMapping("/next-turn/{characterId}")
    public ResponseEntity<Void> advanceTurn(@PathVariable String characterId, Authentication authentication) {
        abilityService.advanceTurn(characterId, authentication);
        return ResponseEntity.ok().build();
    }

    /**
     * Recupera o uso de uma habilidade ou consome recursos para ativá-la.
     */
    @PostMapping("/{abilityId}/recover")
    public ResponseEntity<AbilityDTO> recoverUse(@PathVariable String abilityId, @RequestParam(defaultValue = "MANA") String resource, Authentication authentication) {
        return ResponseEntity.ok(abilityService.recoverUse(abilityId, resource, authentication));
    }

}