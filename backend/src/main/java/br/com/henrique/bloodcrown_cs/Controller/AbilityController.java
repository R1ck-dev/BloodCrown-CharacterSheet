package br.com.henrique.bloodcrown_cs.Controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.Services.AbilityService;

@RestController
@RequestMapping("/abilities")
public class AbilityController {
    
    private final AbilityService abilityService;

    public AbilityController(AbilityService abilityService) {
        this.abilityService = abilityService;
    }

    @PostMapping("/{id}")
    public ResponseEntity<AbilityDTO> addAbility(@PathVariable String id, @RequestBody AbilityDTO abilityDTO, Authentication authentication) {
        AbilityDTO newAbility = abilityService.addAbility(id, abilityDTO, authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newAbility.id()).toUri();

        return ResponseEntity.created(location).body(newAbility);
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteAttack(@PathVariable String id) {
    //     abilityService.
    //     return ResponseEntity.noContent().build();
    // }
}
