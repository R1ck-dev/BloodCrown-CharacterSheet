package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.CreateCharacterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }
    
    @GetMapping
    public ResponseEntity<List<CharacterDTO>> getUserCharacters(Authentication authentication) {
        List<CharacterDTO> response = characterService.getUserCharacters(authentication);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CharacterDTO> createCharacter(@RequestBody CreateCharacterDTO data, Authentication authentication) {
        CharacterDTO newChar = characterService.createCharacter(data, authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newChar.id()).toUri();

        return ResponseEntity.created(location).body(newChar);
    }
    
    
}
