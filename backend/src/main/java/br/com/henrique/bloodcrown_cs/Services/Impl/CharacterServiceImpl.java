package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.CreateCharacterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterAttributes;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterExpertise;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterStatus;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

@Service
public class CharacterServiceImpl implements CharacterService{

    private final CharacterRepository characterRepository;

    public CharacterServiceImpl(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

//--------------------------------Recupera Personagens de um Usuário--------------------------------

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

//-----------------------------------------------------------------------------------
//--------------------------------Cria Personagem--------------------------------

    @Override
    public CharacterDTO createCharacter(CreateCharacterDTO createCharacterDTO, Authentication authentication) {
        UserModel currentUser = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = new CharacterModel();
        charModel.setFromUser(currentUser);
        charModel.setName(createCharacterDTO.name());
        charModel.setCharacterClass(createCharacterDTO.characterClass());
        charModel.setLevel(1);

        CharacterAttributes attr = new CharacterAttributes();
        attr.setForca(createCharacterDTO.attributes().forca());
        attr.setDestreza(createCharacterDTO.attributes().destreza());
        attr.setConstituicao(createCharacterDTO.attributes().constituicao());
        attr.setInteligencia(createCharacterDTO.attributes().inteligencia());
        attr.setSabedoria(createCharacterDTO.attributes().sabedoria());
        attr.setCarisma(createCharacterDTO.attributes().carisma());
        charModel.setAttributes(attr);

        CharacterStatus status = new CharacterStatus();
        status.setMaxHealth(createCharacterDTO.status().maxHealth());
        status.setCurrentHealth(createCharacterDTO.status().maxHealth());
        status.setMaxSanity(createCharacterDTO.status().maxSanity());
        status.setCurrentSanity(createCharacterDTO.status().maxSanity());
        status.setMaxMana(createCharacterDTO.status().maxMana());
        status.setCurrentMana(createCharacterDTO.status().maxMana());
        status.setMaxStamina(createCharacterDTO.status().maxStamina());
        status.setCurrentStamina(createCharacterDTO.status().maxStamina());
        status.setDefense(createCharacterDTO.status().defense());
        charModel.setStatus(status);

        CharacterExpertise expertise = new CharacterExpertise();
        expertise.setAtletismo(createCharacterDTO.expertise().atletismo());
        expertise.setLuta(createCharacterDTO.expertise().luta());
        expertise.setPercepcao(createCharacterDTO.expertise().percepcao());
        charModel.setExpertise(expertise);

        characterRepository.save(charModel);

        return new CharacterDTO(
            charModel.getId(),
            charModel.getName(),
            charModel.getCharacterClass(),
            charModel.getLevel()
        );
    }

} 
