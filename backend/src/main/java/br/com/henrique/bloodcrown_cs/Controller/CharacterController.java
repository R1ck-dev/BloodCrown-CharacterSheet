package br.com.henrique.bloodcrown_cs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }
    
    @GetMapping()
    public ResponseEntity<List<CharacterDTO>> getUserCharacters(Authentication authentication) {
        List<CharacterDTO> response = characterService.getUserCharacters(authentication);

        return ResponseEntity.ok(response);
    }
    
}
