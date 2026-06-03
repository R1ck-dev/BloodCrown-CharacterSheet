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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.CustomSkillDTO;
import br.com.henrique.bloodcrown_cs.Services.CustomSkillService;

/**
 * Controlador das perícias personalizadas (coleção dinâmica do personagem).
 * Mesmo padrão de {@link AttackController}: POST /{characterId}, PUT/DELETE /{customSkillId}.
 */
@RestController
@RequestMapping("/custom-skills")
public class CustomSkillController {

    private final CustomSkillService customSkillService;

    public CustomSkillController(CustomSkillService customSkillService) {
        this.customSkillService = customSkillService;
    }

    /**
     * Adiciona uma perícia personalizada ao personagem. Retorna 201 + Location.
     */
    @PostMapping("/{characterId}")
    public ResponseEntity<CustomSkillDTO> addCustomSkill(@PathVariable String characterId, @RequestBody CustomSkillDTO dto, Authentication authentication) {
        CustomSkillDTO created = customSkillService.addCustomSkill(characterId, dto, authentication);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();

        return ResponseEntity.created(location).body(created);
    }

    /**
     * Atualiza nome/atributo/valor de uma perícia existente. Valida ownership.
     */
    @PutMapping("/{customSkillId}")
    public ResponseEntity<CustomSkillDTO> updateCustomSkill(@PathVariable String customSkillId, @RequestBody CustomSkillDTO dto, Authentication authentication) {
        return ResponseEntity.ok(customSkillService.updateCustomSkill(customSkillId, dto, authentication));
    }

    /**
     * Remove uma perícia personalizada. Valida ownership.
     */
    @DeleteMapping("/{customSkillId}")
    public ResponseEntity<Void> deleteCustomSkill(@PathVariable String customSkillId, Authentication authentication) {
        customSkillService.deleteCustomSkill(customSkillId, authentication);
        return ResponseEntity.noContent().build();
    }
}
