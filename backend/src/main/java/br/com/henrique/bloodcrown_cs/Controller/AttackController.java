package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;
import br.com.henrique.bloodcrown_cs.Services.AttackService;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


/**
 * Controlador responsável por gerenciar os ataques ou armas registradas na ficha do personagem.
 */
@RestController
@RequestMapping("/attacks")
public class AttackController {
    
    private final AttackService attackService;

    public AttackController(AttackService attackService) {
        this.attackService = attackService;
    }

    /**
     * Adiciona um novo ataque ou arma à lista do personagem.
     * * @param id Identificador do personagem.
     * @param attackDTO Objeto contendo os detalhes do ataque (dano, alcance, nome).
     * @param authentication Objeto de autenticação para validar a posse do personagem.
     * @return ResponseEntity com status 201 (Created) e o ataque criado.
     */
    @PostMapping("/{id}")
    public ResponseEntity<AttackDTO> addAttack(@PathVariable String id, @RequestBody AttackDTO attackDTO, Authentication authentication) {
        AttackDTO newAttack = attackService.addAttack(id, attackDTO, authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newAttack.id()).toUri();

        return ResponseEntity.created(location).body(newAttack);
    }

    /**
     * Remove um ataque existente da ficha do personagem.
     * * @param attackId Identificador do ataque a ser removido.
     * @return ResponseEntity com status 204 (No Content).
     */
    @DeleteMapping("/{attackId}")
    public ResponseEntity<Void> deleteAttack(@PathVariable String attackId) {
        attackService.deleteAttack(attackId);
        return ResponseEntity.noContent().build();
    }
    
}