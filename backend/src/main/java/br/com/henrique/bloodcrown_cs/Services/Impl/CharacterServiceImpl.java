package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

@Service
public class CharacterServiceImpl implements CharacterService{

    private final CharacterRepository characterRepository;

    public CharacterServiceImpl(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

    @Override
    public List<CharacterDTO> getUserCharacters(Authentication authentication) {
        //Pega o usuário logado pelo token
        UserModel currentUser = (UserModel) authentication.getPrincipal();

        //Busca as fichas relacionadas a esse ID de usuário
        List<CharacterModel> charactersList = characterRepository.findByFromUserId(currentUser.getId());

        //Coverte Model -> DTO
        List<CharacterDTO> response = charactersList.stream()
                .map(characterModel -> new CharacterDTO(
                    characterModel.getId(),
                    characterModel.getName(),
                    characterModel.getCharacterClass(),
                    characterModel.getLevel()
                ))
                .toList();

        return response;
    }

} 
