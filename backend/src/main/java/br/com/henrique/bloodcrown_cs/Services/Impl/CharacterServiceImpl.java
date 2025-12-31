package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;
import br.com.henrique.bloodcrown_cs.DTOs.AttributesDTO;
import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.DTOs.EffectDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ExpertiseDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.DTOs.StatusDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.CharacterDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterAttributes;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterExpertise;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterStatus;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Services.CharacterService;

/**
 * Implementação das regras de negócio para a gestão de personagens.
 * Realiza operações de CRUD, inicialização de fichas e cálculos de atualização de status.
 */
@Service
public class CharacterServiceImpl implements CharacterService{

    private final CharacterRepository characterRepository;

    public CharacterServiceImpl(CharacterRepository characterRepository) {
        this.characterRepository = characterRepository;
    }

//--------------------------------Recupera Personagens de um Usuário--------------------------------

    /**
     * Recupera a lista de personagens vinculados ao usuário autenticado.
     * Converte as entidades CharacterModel em DTOs resumidos (CharacterDTO) para exibição em listas.
     * * @param authentication Contexto de segurança contendo o usuário logado.
     * @return Lista de personagens simplificada.
     */
    @Override
    public List<CharacterDTO> getUserCharacters(Authentication authentication) {
        //Pega o usuário logado pelo token
        UserModel currentUser = (UserModel) authentication.getPrincipal();

        //Busca as fichas relacionadas a esse ID de usuário
        List<CharacterModel> charactersList = characterRepository.findByFromUserId(currentUser.getId());

        //Coverte Model -> DTO
        return charactersList.stream()
                .map(characterModel -> new CharacterDTO(
                    characterModel.getId(),
                    characterModel.getName(),
                    characterModel.getCharacterClass(),
                    characterModel.getLevel(),
                    characterModel.getAttacks().stream().map(atk -> new AttackDTO(
                        atk.getId(), atk.getName(), atk.getDamageDice(), atk.getDescription()
                    )).toList()
                )).toList();
    }

//-----------------------------------------------------------------------------------
//--------------------------------Cria Personagem--------------------------------

    /**
     * Cria um novo personagem com valores padrão inicializados.
     * Define atributos, perícias e status vitais como 0 ou valores base (10 para vida/mana)
     * para evitar erros de nulos no frontend.
     * * @param authentication Contexto de segurança contendo o usuário proprietário.
     * @return O DTO do personagem recém-criado.
     */
    @Override
    public CharacterDTO createCharacter(Authentication authentication) {
        UserModel currentUser = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = new CharacterModel();
        charModel.setFromUser(currentUser);
        charModel.setName("Novo Personagem");
        charModel.setCharacterClass("");
        charModel.setLevel(1);

        // Inicializa Atributos com 0
        CharacterAttributes attr = new CharacterAttributes();
        attr.setForca(0);
        attr.setDestreza(0);
        attr.setConstituicao(0);
        attr.setInteligencia(0);
        attr.setSabedoria(0);
        attr.setCarisma(0);
        charModel.setAttributes(attr);

        // Define valores iniciais para recursos vitais
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
        status.setDefenseBase(10);
        status.setArmorBonus(0);
        status.setOtherBonus(0);
        charModel.setStatus(status);

        // Inicializa todas as perícias com 0
        CharacterExpertise expertise = new CharacterExpertise();
        expertise.setAtletismo(0);
        expertise.setConhecimento(0);
        expertise.setConsertar(0);
        expertise.setDiplomacia(0);
        expertise.setDomar(0);
        expertise.setEmpatia(0);
        expertise.setFortitude(0);
        expertise.setFurtividade(0);
        expertise.setMagia(0);
        expertise.setIniciativa(0);
        expertise.setIntimidar(0);
        expertise.setIntuicao(0);
        expertise.setInvestigacao(0);
        expertise.setLabia(0);
        expertise.setLadinagem(0);
        expertise.setLuta(0);
        expertise.setMedicina(0);
        expertise.setMente(0);
        expertise.setPercepcao(0);
        expertise.setPontaria(0);
        expertise.setReflexos(0);
        expertise.setSeduzir(0);
        expertise.setSobrevivencia(0);
        charModel.setExpertise(expertise);

        characterRepository.save(charModel);

        return new CharacterDTO(
            charModel.getId(),
            charModel.getName(),
            charModel.getCharacterClass(),
            charModel.getLevel(),
            new java.util.ArrayList<>()
        );
    }
//-----------------------------------------------------------------------------------
//--------------------------------Recupera o Personagem pelo Id--------------------------------

    /**
     * Busca uma ficha completa pelo ID, validando se pertence ao usuário solicitante.
     * Realiza a conversão de toda a árvore de objetos (Atributos, Status, Inventário, Habilidades)
     * para o formato CharacterSheetDTO.
     * * @param id Identificador da ficha.
     * @param authentication Contexto de segurança.
     * @return O DTO completo da ficha.
     */
    @Override
    public CharacterSheetDTO getCharacterById(String id, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Ficha não encontrada ou permissão negada."));

        // Conversão manual de Atributos
        AttributesDTO attr = new AttributesDTO(
            charModel.getAttributes().getForca(),
            charModel.getAttributes().getDestreza(),
            charModel.getAttributes().getSabedoria(),
            charModel.getAttributes().getInteligencia(),
            charModel.getAttributes().getCarisma(),
            charModel.getAttributes().getConstituicao()
        );

        // Conversão manual de Status
        StatusDTO status = new StatusDTO(
            charModel.getStatus().getMaxHealth(),
            charModel.getStatus().getCurrentHealth(),
            charModel.getStatus().getMaxSanity(),
            charModel.getStatus().getCurrentSanity(),
            charModel.getStatus().getMaxMana(),
            charModel.getStatus().getCurrentMana(),
            charModel.getStatus().getMaxStamina(),
            charModel.getStatus().getCurrentStamina(),
            charModel.getStatus().getDefense(),
            charModel.getStatus().getDefenseBase(),
            charModel.getStatus().getArmorBonus(),
            charModel.getStatus().getOtherBonus(),
            charModel.getStatus().getPhysicalRes(),
            charModel.getStatus().getMagicalRes()
        );

        // Conversão manual de Perícias
        ExpertiseDTO expertise = new ExpertiseDTO(
            charModel.getExpertise().getAtletismo(),
            charModel.getExpertise().getConhecimento(),
            charModel.getExpertise().getConsertar(),
            charModel.getExpertise().getDiplomacia(),
            charModel.getExpertise().getDomar(),
            charModel.getExpertise().getEmpatia(),
            charModel.getExpertise().getFortitude(),
            charModel.getExpertise().getFurtividade(),
            charModel.getExpertise().getMagia(),
            charModel.getExpertise().getIniciativa(),
            charModel.getExpertise().getIntimidar(),
            charModel.getExpertise().getIntuicao(),
            charModel.getExpertise().getInvestigacao(),
            charModel.getExpertise().getLabia(),
            charModel.getExpertise().getLadinagem(),
            charModel.getExpertise().getLuta(),
            charModel.getExpertise().getMedicina(),
            charModel.getExpertise().getMente(),
            charModel.getExpertise().getPercepcao(),
            charModel.getExpertise().getPontaria(),
            charModel.getExpertise().getReflexos(),
            charModel.getExpertise().getSeduzir(),
            charModel.getExpertise().getSobrevivencia()
        );

        // Conversão de Listas (Ataques, Habilidades, Inventário)
        List<AttackDTO> attacks = charModel.getAttacks().stream()
            .map(atk -> new AttackDTO(
                atk.getId(),
                atk.getName(),
                atk.getDamageDice(),
                atk.getDescription()
            )).toList();

        List<AbilityDTO> abilities = charModel.getAbilities().stream()
            .map(ab -> {
                List<EffectDTO> effects = ab.getEffects() != null 
                    ? ab.getEffects().stream()
                        .map(e -> new EffectDTO(e.getTargetAttribute(), e.getEffectValue()))
                        .toList()
                    : new ArrayList<>();

                return new AbilityDTO(
                    ab.getId(),
                    ab.getName(),
                    ab.getCategory(),
                    ab.getResourceType(),
                    ab.getActionType(),
                    ab.getMaxUses(),
                    ab.getCurrentUses(),
                    ab.getDiceRoll(),
                    effects, 
                    ab.getDurationDice(),
                    ab.getIsActive(),
                    ab.getTurnsRemaining(),
                    ab.getDescription()
                );
            }).toList();
        
        List<ItemDTO> inventory = charModel.getInventory().stream()
        .map(i -> new ItemDTO(i.getId(), i.getName(), i.getDescription(), i.getIsEquipped(), i.getTargetAttribute(), i.getEffectValue()))
        .toList();

        return new CharacterSheetDTO(
            charModel.getId(),
            charModel.getName(),
            charModel.getCharacterClass(),
            charModel.getLevel(),
            attr,
            status,
            expertise,
            attacks,
            abilities,
            inventory,
            charModel.getMoney(),
            charModel.getHeroPoint(),
            charModel.getBiography()
        );
    }
//-----------------------------------------------------------------------------------

    /**
     * Atualiza os dados de um personagem existente.
     * Verifica cada campo do DTO e atualiza apenas se o valor não for nulo.
     * Implementa lógica para garantir que os valores atuais (Vida, Mana) não excedam os máximos.
     * * @param id Identificador da ficha.
     * @param dto DTO contendo os dados a serem atualizados.
     * @param authentication Contexto de segurança.
     * @return O DTO atualizado.
     */
    @Override
    public CharacterSheetDTO updateCharacter(String id, CharacterSheetDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Ficha não encontrada ou permissão negada."));

        charModel.setName(dto.name());
        charModel.setCharacterClass(dto.characterClass());
        charModel.setLevel(dto.level());
        charModel.setMoney(dto.money());
        charModel.setHeroPoint(dto.heroPoint());
        charModel.setBiography(dto.biography());

        // Atualização de Atributos
        if (dto.attributes() != null) {
            charModel.getAttributes().setForca(dto.attributes().forca());
            charModel.getAttributes().setDestreza(dto.attributes().destreza());
            charModel.getAttributes().setConstituicao(dto.attributes().constituicao());
            charModel.getAttributes().setInteligencia(dto.attributes().inteligencia());
            charModel.getAttributes().setSabedoria(dto.attributes().sabedoria());
            charModel.getAttributes().setCarisma(dto.attributes().carisma());
        }

        // Atualização de Status e verificação de limites (Caps)
        if (dto.status() != null) {
            Integer newMaxHealth = dto.status().maxHealth();
            Integer newMaxMana = dto.status().maxMana();
            Integer newMaxSanity = dto.status().maxSanity();
            Integer newMaxStamina = dto.status().maxStamina();

            if (newMaxHealth != null) charModel.getStatus().setMaxHealth(newMaxHealth);
            if (newMaxMana != null) charModel.getStatus().setMaxMana(newMaxMana);
            if (newMaxSanity != null) charModel.getStatus().setMaxSanity(newMaxSanity);
            if (newMaxStamina != null) charModel.getStatus().setMaxStamina(newMaxStamina);

            if (dto.status().defense() != null) {
                charModel.getStatus().setDefense(dto.status().defense());
            }

            if (dto.status().defenseBase() != null) {
                charModel.getStatus().setDefenseBase(dto.status().defenseBase());
            }
            if (dto.status().armorBonus() != null) {
                charModel.getStatus().setArmorBonus(dto.status().armorBonus());
            }
            if (dto.status().otherBonus() != null) {
                charModel.getStatus().setOtherBonus(dto.status().otherBonus());
            }

            if (dto.status().physicalRes() != null) {
                charModel.getStatus().setPhysicalRes(dto.status().physicalRes());
            }

            if (dto.status().magicalRes() != null) {
                charModel.getStatus().setMagicalRes(dto.status().magicalRes());
            }

            // Lógica de Cap: Valor Atual não pode ser maior que o Máximo nem menor que 0
            Integer currHealth = dto.status().currentHealth();
            if (currHealth != null) {
                int capped = Math.max(0, Math.min(currHealth, charModel.getStatus().getMaxHealth()));
                charModel.getStatus().setCurrentHealth(capped);
            }

            Integer currMana = dto.status().currentMana();
            if (currMana != null) {
                int capped = Math.max(0, Math.min(currMana, charModel.getStatus().getMaxMana()));
                charModel.getStatus().setCurrentMana(capped);
            }

            Integer currSanity = dto.status().currentSanity();
            if (currSanity != null) {
                int capped = Math.max(0, Math.min(currSanity, charModel.getStatus().getMaxSanity()));
                charModel.getStatus().setCurrentSanity(capped);
            }

            Integer currStamina = dto.status().currentStamina();
            if (currStamina != null) {
                int capped = Math.max(0, Math.min(currStamina, charModel.getStatus().getMaxStamina()));
                charModel.getStatus().setCurrentStamina(capped);
            }
        }

        // Atualização de Perícias
        if (dto.expertise() != null) {
            charModel.getExpertise().setAtletismo(dto.expertise().atletismo());
            charModel.getExpertise().setConhecimento(dto.expertise().conhecimento());
            charModel.getExpertise().setConsertar(dto.expertise().consertar());
            charModel.getExpertise().setDiplomacia(dto.expertise().diplomacia());
            charModel.getExpertise().setDomar(dto.expertise().domar());
            charModel.getExpertise().setEmpatia(dto.expertise().empatia());
            charModel.getExpertise().setFortitude(dto.expertise().fortitude());
            charModel.getExpertise().setFurtividade(dto.expertise().furtividade());
            charModel.getExpertise().setMagia(dto.expertise().magia());
            charModel.getExpertise().setIniciativa(dto.expertise().iniciativa());
            charModel.getExpertise().setIntimidar(dto.expertise().intimidar());
            charModel.getExpertise().setIntuicao(dto.expertise().intuicao());
            charModel.getExpertise().setInvestigacao(dto.expertise().investigacao());
            charModel.getExpertise().setLabia(dto.expertise().labia());
            charModel.getExpertise().setLadinagem(dto.expertise().ladinagem());
            charModel.getExpertise().setLuta(dto.expertise().luta());
            charModel.getExpertise().setMedicina(dto.expertise().medicina());
            charModel.getExpertise().setMente(dto.expertise().mente());
            charModel.getExpertise().setPercepcao(dto.expertise().percepcao());
            charModel.getExpertise().setPontaria(dto.expertise().pontaria());
            charModel.getExpertise().setReflexos(dto.expertise().reflexos());
            charModel.getExpertise().setSeduzir(dto.expertise().seduzir());
            charModel.getExpertise().setSobrevivencia(dto.expertise().sobrevivencia());
            
        }



        characterRepository.save(charModel);
        return dto; 
    }
//-----------------------------------------------------------------------------------

    /**
     * Remove permanentemente um personagem do sistema.
     * * @param id Identificador da ficha.
     * @param authentication Contexto de segurança.
     */
    @Override
    public void deleteCharacter(String id, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();

        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Ficha não encontrada ou permissão negada."));

        characterRepository.delete(charModel);
    }

    /**
     * Restaura os recursos do personagem (Vida, Mana, Estamina) aos valores máximos.
     * Reinicia os usos e o estado de ativação de todas as habilidades.
     * Simula um "Descanso Longo" no RPG.
     * * @param id Identificador da ficha.
     * @param authentication Contexto de segurança.
     */
    @Override
    public void restCharacter(String id, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();
        CharacterModel charModel = characterRepository.findByIdAndFromUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Ficha não encontrada."));

        CharacterStatus status = charModel.getStatus();
        if (status != null) {
            status.setCurrentHealth(status.getMaxHealth());
            status.setCurrentMana(status.getMaxMana());
            status.setCurrentSanity(status.getMaxSanity());
            status.setCurrentStamina(status.getMaxStamina());
        }

        if (charModel.getAbilities() != null) {
            for (br.com.henrique.bloodcrown_cs.Models.AbilityModel ability : charModel.getAbilities()) {
                if (ability.getMaxUses() != null) {
                    ability.setCurrentUses(ability.getMaxUses());
                }
                
                ability.setIsActive(false);
                ability.setTurnsRemaining(0);
            }
        }

        characterRepository.save(charModel);
    }

}