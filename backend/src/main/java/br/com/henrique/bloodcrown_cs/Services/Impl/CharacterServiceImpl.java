package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AttributesDTO;
import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ExpertiseDTO;
import br.com.henrique.bloodcrown_cs.DTOs.StatusDTO;
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
    public CharacterDTO createCharacter(Authentication authentication) {
        UserModel currentUser = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = new CharacterModel();
        charModel.setFromUser(currentUser);
        charModel.setName("Novo Personagem");
        charModel.setCharacterClass("");
        charModel.setLevel(1);

        CharacterAttributes attr = new CharacterAttributes();
        attr.setForca(0);
        attr.setDestreza(0);
        attr.setConstituicao(0);
        attr.setInteligencia(0);
        attr.setSabedoria(0);
        attr.setCarisma(0);
        charModel.setAttributes(attr);

        Integer maxHealth = 10;
        Integer maxMana = 10;
        Integer maxStamina = 10;
        Integer maxSanity = 10;

        CharacterStatus status = new CharacterStatus();
        status.setMaxHealth(maxHealth);
        status.setCurrentHealth(maxHealth);
        status.setMaxSanity(maxSanity);
        status.setCurrentSanity(maxSanity);
        status.setMaxMana(maxMana);
        status.setCurrentMana(maxMana);
        status.setMaxStamina(maxStamina);
        status.setCurrentStamina(maxStamina);
        status.setDefense(10);
        charModel.setStatus(status);

        CharacterExpertise expertise = new CharacterExpertise();
        expertise.setAtletismo(0);
        expertise.setLuta(0);
        expertise.setPercepcao(0);
        charModel.setExpertise(expertise);

        characterRepository.save(charModel);

        return new CharacterDTO(
            charModel.getId(),
            charModel.getName(),
            charModel.getCharacterClass(),
            charModel.getLevel()
        );
    }
//-----------------------------------------------------------------------------------
//--------------------------------Recupera o Personagem pelo Id--------------------------------

    @Override
    public CharacterSheetDTO getCharacterById(String id, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Ficha não encontrada ou permissão negada."));

        AttributesDTO attr = new AttributesDTO(
            charModel.getAttributes().getForca(),
            charModel.getAttributes().getDestreza(),
            charModel.getAttributes().getSabedoria(),
            charModel.getAttributes().getInteligencia(),
            charModel.getAttributes().getCarisma(),
            charModel.getAttributes().getConstituicao()
        );

        StatusDTO status = new StatusDTO(
            charModel.getStatus().getMaxHealth(),
            charModel.getStatus().getMaxSanity(),
            charModel.getStatus().getMaxMana(),
            charModel.getStatus().getMaxStamina(),
            charModel.getStatus().getDefense()
        );

        ExpertiseDTO expertise = new ExpertiseDTO(
            charModel.getExpertise().getAtletismo(),
            charModel.getExpertise().getLuta(),
            charModel.getExpertise().getPercepcao()
        );

        return new CharacterSheetDTO(
            charModel.getId(),
            charModel.getName(),
            charModel.getCharacterClass(),
            charModel.getLevel(),
            attr,
            status,
            expertise
        );
    }
//-----------------------------------------------------------------------------------

    @Override
    public CharacterSheetDTO updateCharacter(String id, CharacterSheetDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Ficha não encontrada ou permissão negada."));

        charModel.setName(dto.name());
        charModel.setCharacterClass(dto.characterClass());
        charModel.setLevel(dto.level());

        if (dto.attributes() != null) {
            charModel.getAttributes().setForca(dto.attributes().forca());
            charModel.getAttributes().setDestreza(dto.attributes().destreza());
            charModel.getAttributes().setConstituicao(dto.attributes().constituicao());
            charModel.getAttributes().setInteligencia(dto.attributes().inteligencia());
            charModel.getAttributes().setSabedoria(dto.attributes().sabedoria());
            charModel.getAttributes().setCarisma(dto.attributes().carisma());
        }

        if (dto.status() != null) {
            charModel.getStatus().setMaxHealth(dto.status().maxHealth());
            charModel.getStatus().setMaxMana(dto.status().maxMana());
            charModel.getStatus().setMaxSanity(dto.status().maxSanity());
            charModel.getStatus().setMaxStamina(dto.status().maxStamina());
            charModel.getStatus().setDefense(dto.status().defense());
            
            charModel.getStatus().setCurrentHealth(dto.status().maxHealth()); 
            charModel.getStatus().setCurrentMana(dto.status().maxMana());
            charModel.getStatus().setCurrentSanity(dto.status().maxSanity());
            charModel.getStatus().setCurrentStamina(dto.status().maxStamina());
        }

        if (dto.expertise() != null) {
            charModel.getExpertise().setAtletismo(dto.expertise().atletismo());
            charModel.getExpertise().setLuta(dto.expertise().luta());
            charModel.getExpertise().setPercepcao(dto.expertise().percepcao());
        }

        characterRepository.save(charModel);
        return dto; 
    }




} 
