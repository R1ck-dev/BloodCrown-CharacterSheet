package br.com.henrique.bloodcrown_cs.Services;

import java.util.List;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.CreateCharacterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;

public interface CharacterService {
    List<CharacterDTO> getUserCharacters(Authentication authentication);
    CharacterDTO createCharacter(CreateCharacterDTO createCharacterDTO, Authentication authentication);
} 