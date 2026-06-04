package br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.character.model.Ability;
import br.com.henrique.bloodcrown_cs.domain.character.model.ActionPool;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attack;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attributes;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.CustomSkill;
import br.com.henrique.bloodcrown_cs.domain.character.model.Expertise;
import br.com.henrique.bloodcrown_cs.domain.character.model.Item;
import br.com.henrique.bloodcrown_cs.domain.character.model.Status;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.AbilityDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.ActionPoolDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.AttackDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.AttributesDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSheetDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSummaryDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CustomSkillDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.EffectDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.ExpertiseDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.ItemDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.StatusDto;

/**
 * Mapeia o domínio Character para os DTOs web (response) e os DTOs de value object
 * (request) para os value objects de domínio. Mantém os mesmos shapes JSON do MVC anterior
 * (espelha o antigo CharacterSheetMapper).
 */
@Component
public class CharacterWebMapper {

    // ----------------------------------------------------------- domínio -> response

    public CharacterSheetDto toSheet(Character c) {
        return new CharacterSheetDto(
            c.getId(),
            c.getName(),
            c.getCharacterClass(),
            c.getLevel(),
            toAttributesDto(c.getAttributes()),
            toStatusDto(c.getStatus()),
            toExpertiseDto(c.getExpertise()),
            c.getAttacks().stream().map(this::toAttackDto).toList(),
            c.getAbilities().stream().map(this::toAbilityDto).toList(),
            c.getInventory().stream().map(this::toItemDto).toList(),
            c.getCustomSkills().stream().map(this::toCustomSkillDto).toList(),
            c.getMoney(),
            c.getHeroPoint(),
            c.getBiography(),
            toActionPoolDto(c.getActionPool())
        );
    }

    public CharacterSummaryDto toSummary(Character c) {
        Status status = c.getStatus();
        Integer currentHealth = status != null ? status.getCurrentHealth() : null;
        Integer maxHealth = status != null ? status.getMaxHealth() : null;
        return new CharacterSummaryDto(
            c.getId(),
            c.getName(),
            c.getCharacterClass(),
            c.getLevel(),
            c.getAttacks().stream().map(this::toAttackDto).toList(),
            currentHealth,
            maxHealth,
            c.getFolderId()
        );
    }

    public AttackDto toAttackDto(Attack a) {
        return new AttackDto(a.getId(), a.getName(), a.getDamageDice(), a.getDescription());
    }

    public AbilityDto toAbilityDto(Ability ab) {
        List<EffectDto> effects = ab.getEffects() != null
            ? ab.getEffects().stream().map(e -> new EffectDto(e.getTargetAttribute(), e.getEffectValue())).toList()
            : List.of();
        return new AbilityDto(
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
    }

    public ItemDto toItemDto(Item i) {
        return new ItemDto(
            i.getId(),
            i.getName(),
            i.getDescription(),
            i.getIsEquipped(),
            i.getTargetAttribute(),
            i.getEffectValue(),
            i.getQuantity() != null ? i.getQuantity() : 1,
            i.getUseDice()
        );
    }

    public CustomSkillDto toCustomSkillDto(CustomSkill cs) {
        return new CustomSkillDto(cs.getId(), cs.getName(), cs.getAttribute(), cs.getValue());
    }

    private AttributesDto toAttributesDto(Attributes a) {
        if (a == null) return null;
        return new AttributesDto(a.getForca(), a.getDestreza(), a.getSabedoria(),
                a.getInteligencia(), a.getCarisma(), a.getConstituicao());
    }

    private StatusDto toStatusDto(Status s) {
        if (s == null) return null;
        return new StatusDto(s.getMaxHealth(), s.getCurrentHealth(), s.getMaxSanity(), s.getCurrentSanity(),
                s.getMaxMana(), s.getCurrentMana(), s.getMaxStamina(), s.getCurrentStamina(),
                s.getDefense(), s.getDefenseBase(), s.getArmorBonus(), s.getOtherBonus(),
                s.getPhysicalRes(), s.getMagicalRes());
    }

    private ExpertiseDto toExpertiseDto(Expertise x) {
        if (x == null) return null;
        return new ExpertiseDto(x.getAtletismo(), x.getConhecimento(), x.getConsertar(), x.getDiplomacia(),
                x.getDomar(), x.getEmpatia(), x.getFortitude(), x.getFurtividade(), x.getMagia(),
                x.getIniciativa(), x.getIntimidar(), x.getIntuicao(), x.getInvestigacao(), x.getLabia(),
                x.getLadinagem(), x.getLuta(), x.getMedicina(), x.getMente(), x.getPercepcao(),
                x.getPontaria(), x.getReflexos(), x.getSeduzir(), x.getSobrevivencia());
    }

    private ActionPoolDto toActionPoolDto(ActionPool p) {
        if (p == null) return null;
        return new ActionPoolDto(p.getMaxStandard(), p.getCurrentStandard(), p.getMaxBonus(), p.getCurrentBonus(),
                p.getMaxMovement(), p.getCurrentMovement(), p.getMaxReaction(), p.getCurrentReaction());
    }

    // ----------------------------------------------------------- request -> domínio (VO)

    public Attributes toAttributesDomain(AttributesDto d) {
        if (d == null) return null;
        Attributes a = new Attributes();
        a.setForca(d.forca());
        a.setDestreza(d.destreza());
        a.setSabedoria(d.sabedoria());
        a.setInteligencia(d.inteligencia());
        a.setCarisma(d.carisma());
        a.setConstituicao(d.constituicao());
        return a;
    }

    public Status toStatusDomain(StatusDto d) {
        if (d == null) return null;
        Status s = new Status();
        s.setMaxHealth(d.maxHealth());
        s.setCurrentHealth(d.currentHealth());
        s.setMaxSanity(d.maxSanity());
        s.setCurrentSanity(d.currentSanity());
        s.setMaxMana(d.maxMana());
        s.setCurrentMana(d.currentMana());
        s.setMaxStamina(d.maxStamina());
        s.setCurrentStamina(d.currentStamina());
        s.setDefense(d.defense());
        s.setDefenseBase(d.defenseBase());
        s.setArmorBonus(d.armorBonus());
        s.setOtherBonus(d.otherBonus());
        s.setPhysicalRes(d.physicalRes());
        s.setMagicalRes(d.magicalRes());
        return s;
    }

    public Expertise toExpertiseDomain(ExpertiseDto d) {
        if (d == null) return null;
        Expertise x = new Expertise();
        x.setAtletismo(d.atletismo());
        x.setConhecimento(d.conhecimento());
        x.setConsertar(d.consertar());
        x.setDiplomacia(d.diplomacia());
        x.setDomar(d.domar());
        x.setEmpatia(d.empatia());
        x.setFortitude(d.fortitude());
        x.setFurtividade(d.furtividade());
        x.setMagia(d.magia());
        x.setIniciativa(d.iniciativa());
        x.setIntimidar(d.intimidar());
        x.setIntuicao(d.intuicao());
        x.setInvestigacao(d.investigacao());
        x.setLabia(d.labia());
        x.setLadinagem(d.ladinagem());
        x.setLuta(d.luta());
        x.setMedicina(d.medicina());
        x.setMente(d.mente());
        x.setPercepcao(d.percepcao());
        x.setPontaria(d.pontaria());
        x.setReflexos(d.reflexos());
        x.setSeduzir(d.seduzir());
        x.setSobrevivencia(d.sobrevivencia());
        return x;
    }

    public ActionPool toActionPoolDomain(ActionPoolDto d) {
        if (d == null) return null;
        ActionPool p = new ActionPool();
        p.setMaxStandard(d.maxStandard());
        p.setCurrentStandard(d.currentStandard());
        p.setMaxBonus(d.maxBonus());
        p.setCurrentBonus(d.currentBonus());
        p.setMaxMovement(d.maxMovement());
        p.setCurrentMovement(d.currentMovement());
        p.setMaxReaction(d.maxReaction());
        p.setCurrentReaction(d.currentReaction());
        return p;
    }
}
