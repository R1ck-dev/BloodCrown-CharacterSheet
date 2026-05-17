package br.com.henrique.bloodcrown_cs.Services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.DTOs.AbilityDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ActionPoolDTO;
import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;
import br.com.henrique.bloodcrown_cs.DTOs.AttributesDTO;
import br.com.henrique.bloodcrown_cs.DTOs.CharacterSheetDTO;
import br.com.henrique.bloodcrown_cs.DTOs.EffectDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ExpertiseDTO;
import br.com.henrique.bloodcrown_cs.DTOs.ItemDTO;
import br.com.henrique.bloodcrown_cs.DTOs.StatusDTO;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.Embeddables.CharacterActionPool;

/**
 * Mapper centralizado de CharacterModel -> CharacterSheetDTO. Compartilhado entre
 * services para que endpoints de "side effect" (toggle, recover, advance, rest)
 * retornem o estado completo da ficha, eliminando o GET extra que o front precisaria
 * pra sincronizar o cache.
 */
@Component
public class CharacterSheetMapper {

    public CharacterSheetDTO toDto(CharacterModel charModel) {
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
            .map(i -> new ItemDTO(
                i.getId(),
                i.getName(),
                i.getDescription(),
                i.getIsEquipped(),
                i.getTargetAttribute(),
                i.getEffectValue(),
                i.getQuantity() != null ? i.getQuantity() : 1,
                i.getUseDice()
            ))
            .toList();

        CharacterActionPool poolModel = charModel.getActionPool();
        ActionPoolDTO actionPool = poolModel != null
            ? new ActionPoolDTO(
                poolModel.getMaxStandard(),  poolModel.getCurrentStandard(),
                poolModel.getMaxBonus(),     poolModel.getCurrentBonus(),
                poolModel.getMaxMovement(),  poolModel.getCurrentMovement(),
                poolModel.getMaxReaction(),  poolModel.getCurrentReaction()
            )
            : null;

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
            charModel.getBiography(),
            actionPool
        );
    }
}
