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
    public ResponseEntity<CharacterDTO> createCharacter(Authentication authentication) {
        CharacterDTO newChar = characterService.createCharacter(authentication);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newChar.id()).toUri();

        return ResponseEntity.created(location).body(newChar);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CharacterSheetDTO> getCharacterById(@PathVariable String id, Authentication authentication) {
        CharacterSheetDTO character = characterService.getCharacterById(id, authentication);
        return ResponseEntity.ok(character);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CharacterSheetDTO> updateCharacter(@PathVariable String id, @RequestBody CharacterSheetDTO characterSheetDTO, Authentication authentication) {
        CharacterSheetDTO updatedCharacter = characterService.updateCharacter(id, characterSheetDTO, authentication);
        return ResponseEntity.ok(updatedCharacter);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable String id, Authentication authentication) {
        characterService.deleteCharacter(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
