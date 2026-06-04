package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.character.model.Ability;
import br.com.henrique.bloodcrown_cs.domain.character.model.AbilityEffect;
import br.com.henrique.bloodcrown_cs.domain.character.model.ActionPool;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attack;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attributes;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.CustomSkill;
import br.com.henrique.bloodcrown_cs.domain.character.model.Expertise;
import br.com.henrique.bloodcrown_cs.domain.character.model.Item;
import br.com.henrique.bloodcrown_cs.domain.character.model.Status;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.AbilityEffectJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.AbilityJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.AttackJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.CharacterJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.CustomSkillJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.ItemJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.ActionPoolEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.AttributesEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.ExpertiseEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.embeddable.StatusEmbeddable;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.entity.FolderJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

/**
 * Mapeamento bidirecional do agregado Character (raiz + value objects + filhos).
 * Usa EntityManager.getReference para as FKs de usuário/pasta, evitando SELECTs extras.
 */
@Component
@RequiredArgsConstructor
public class CharacterMapper {

    private final EntityManager entityManager;

    // ---------------------------------------------------------------- domain -> entity

    public CharacterJpaEntity toEntity(Character domain) {
        CharacterJpaEntity entity = new CharacterJpaEntity();
        entity.setId(domain.getId());
        entity.setUser(entityManager.getReference(UserJpaEntity.class, domain.getOwnerUserId()));
        entity.setFolder(domain.getFolderId() != null
                ? entityManager.getReference(FolderJpaEntity.class, domain.getFolderId())
                : null);
        entity.setName(domain.getName());
        entity.setCharacterClass(domain.getCharacterClass());
        entity.setLevel(domain.getLevel());
        entity.setMoney(domain.getMoney());
        entity.setHeroPoint(domain.getHeroPoint());
        entity.setBiography(domain.getBiography());

        entity.setAttributes(toAttributesEmbeddable(domain.getAttributes()));
        entity.setStatus(toStatusEmbeddable(domain.getStatus()));
        entity.setExpertise(toExpertiseEmbeddable(domain.getExpertise()));
        entity.setActionPool(toActionPoolEmbeddable(domain.getActionPool()));

        List<AttackJpaEntity> attacks = new ArrayList<>();
        for (Attack a : domain.getAttacks()) {
            attacks.add(toAttackEntity(a, entity));
        }
        entity.setAttacks(attacks);

        List<AbilityJpaEntity> abilities = new ArrayList<>();
        for (Ability ab : domain.getAbilities()) {
            abilities.add(toAbilityEntity(ab, entity));
        }
        entity.setAbilities(abilities);

        List<ItemJpaEntity> inventory = new ArrayList<>();
        for (Item i : domain.getInventory()) {
            inventory.add(toItemEntity(i, entity));
        }
        entity.setInventory(inventory);

        List<CustomSkillJpaEntity> customSkills = new ArrayList<>();
        for (CustomSkill cs : domain.getCustomSkills()) {
            customSkills.add(toCustomSkillEntity(cs, entity));
        }
        entity.setCustomSkills(customSkills);

        return entity;
    }

    private AttackJpaEntity toAttackEntity(Attack a, CharacterJpaEntity parent) {
        AttackJpaEntity e = new AttackJpaEntity();
        e.setId(a.getId());
        e.setName(a.getName());
        e.setDamageDice(a.getDamageDice());
        e.setDescription(a.getDescription());
        e.setCharacter(parent);
        return e;
    }

    private AbilityJpaEntity toAbilityEntity(Ability ab, CharacterJpaEntity parent) {
        AbilityJpaEntity e = new AbilityJpaEntity();
        e.setId(ab.getId());
        e.setName(ab.getName());
        e.setCategory(ab.getCategory());
        e.setResourceType(ab.getResourceType());
        e.setActionType(ab.getActionType());
        e.setMaxUses(ab.getMaxUses());
        e.setCurrentUses(ab.getCurrentUses());
        e.setDiceRoll(ab.getDiceRoll());
        e.setDurationDice(ab.getDurationDice());
        e.setIsActive(ab.getIsActive());
        e.setTurnsRemaining(ab.getTurnsRemaining());
        e.setDescription(ab.getDescription());
        e.setCharacter(parent);

        List<AbilityEffectJpaEntity> effects = new ArrayList<>();
        if (ab.getEffects() != null) {
            for (AbilityEffect eff : ab.getEffects()) {
                AbilityEffectJpaEntity ee = new AbilityEffectJpaEntity();
                ee.setId(eff.getId());
                ee.setTargetAttribute(eff.getTargetAttribute());
                ee.setEffectValue(eff.getEffectValue());
                ee.setAbility(e);
                effects.add(ee);
            }
        }
        e.setEffects(effects);
        return e;
    }

    private ItemJpaEntity toItemEntity(Item i, CharacterJpaEntity parent) {
        ItemJpaEntity e = new ItemJpaEntity();
        e.setId(i.getId());
        e.setName(i.getName());
        e.setDescription(i.getDescription());
        e.setIsEquipped(i.getIsEquipped());
        e.setTargetAttribute(i.getTargetAttribute());
        e.setEffectValue(i.getEffectValue());
        e.setQuantity(i.getQuantity());
        e.setUseDice(i.getUseDice());
        e.setCharacter(parent);
        return e;
    }

    private CustomSkillJpaEntity toCustomSkillEntity(CustomSkill cs, CharacterJpaEntity parent) {
        CustomSkillJpaEntity e = new CustomSkillJpaEntity();
        e.setId(cs.getId());
        e.setName(cs.getName());
        e.setAttribute(cs.getAttribute());
        e.setValue(cs.getValue());
        e.setCharacter(parent);
        return e;
    }

    private AttributesEmbeddable toAttributesEmbeddable(Attributes a) {
        if (a == null) return null;
        AttributesEmbeddable e = new AttributesEmbeddable();
        e.setForca(a.getForca());
        e.setDestreza(a.getDestreza());
        e.setSabedoria(a.getSabedoria());
        e.setInteligencia(a.getInteligencia());
        e.setCarisma(a.getCarisma());
        e.setConstituicao(a.getConstituicao());
        return e;
    }

    private StatusEmbeddable toStatusEmbeddable(Status s) {
        if (s == null) return null;
        StatusEmbeddable e = new StatusEmbeddable();
        e.setMaxHealth(s.getMaxHealth());
        e.setCurrentHealth(s.getCurrentHealth());
        e.setMaxSanity(s.getMaxSanity());
        e.setCurrentSanity(s.getCurrentSanity());
        e.setMaxMana(s.getMaxMana());
        e.setCurrentMana(s.getCurrentMana());
        e.setMaxStamina(s.getMaxStamina());
        e.setCurrentStamina(s.getCurrentStamina());
        e.setDefense(s.getDefense());
        e.setDefenseBase(s.getDefenseBase());
        e.setArmorBonus(s.getArmorBonus());
        e.setOtherBonus(s.getOtherBonus());
        e.setPhysicalRes(s.getPhysicalRes());
        e.setMagicalRes(s.getMagicalRes());
        return e;
    }

    private ExpertiseEmbeddable toExpertiseEmbeddable(Expertise x) {
        if (x == null) return null;
        ExpertiseEmbeddable e = new ExpertiseEmbeddable();
        e.setAtletismo(x.getAtletismo());
        e.setLuta(x.getLuta());
        e.setPontaria(x.getPontaria());
        e.setReflexos(x.getReflexos());
        e.setFortitude(x.getFortitude());
        e.setFurtividade(x.getFurtividade());
        e.setConhecimento(x.getConhecimento());
        e.setInvestigacao(x.getInvestigacao());
        e.setMedicina(x.getMedicina());
        e.setMente(x.getMente());
        e.setMagia(x.getMagia());
        e.setPercepcao(x.getPercepcao());
        e.setIntuicao(x.getIntuicao());
        e.setEmpatia(x.getEmpatia());
        e.setDiplomacia(x.getDiplomacia());
        e.setIntimidar(x.getIntimidar());
        e.setLabia(x.getLabia());
        e.setSeduzir(x.getSeduzir());
        e.setConsertar(x.getConsertar());
        e.setDomar(x.getDomar());
        e.setIniciativa(x.getIniciativa());
        e.setLadinagem(x.getLadinagem());
        e.setSobrevivencia(x.getSobrevivencia());
        return e;
    }

    private ActionPoolEmbeddable toActionPoolEmbeddable(ActionPool p) {
        if (p == null) return null;
        ActionPoolEmbeddable e = new ActionPoolEmbeddable();
        e.setMaxStandard(p.getMaxStandard());
        e.setCurrentStandard(p.getCurrentStandard());
        e.setMaxBonus(p.getMaxBonus());
        e.setCurrentBonus(p.getCurrentBonus());
        e.setMaxMovement(p.getMaxMovement());
        e.setCurrentMovement(p.getCurrentMovement());
        e.setMaxReaction(p.getMaxReaction());
        e.setCurrentReaction(p.getCurrentReaction());
        return e;
    }

    // ---------------------------------------------------------------- entity -> domain

    public Character toDomain(CharacterJpaEntity entity) {
        List<Attack> attacks = new ArrayList<>();
        for (AttackJpaEntity a : entity.getAttacks()) {
            attacks.add(toAttackDomain(a));
        }

        List<Ability> abilities = new ArrayList<>();
        for (AbilityJpaEntity ab : entity.getAbilities()) {
            abilities.add(toAbilityDomain(ab));
        }

        List<Item> inventory = new ArrayList<>();
        for (ItemJpaEntity i : entity.getInventory()) {
            inventory.add(toItemDomain(i));
        }

        List<CustomSkill> customSkills = new ArrayList<>();
        for (CustomSkillJpaEntity cs : entity.getCustomSkills()) {
            customSkills.add(toCustomSkillDomain(cs));
        }

        return new Character(
            entity.getId(),
            entity.getUser() != null ? entity.getUser().getId() : null,
            entity.getFolder() != null ? entity.getFolder().getId() : null,
            entity.getName(),
            entity.getCharacterClass(),
            entity.getLevel(),
            toAttributesDomain(entity.getAttributes()),
            toStatusDomain(entity.getStatus()),
            toExpertiseDomain(entity.getExpertise()),
            toActionPoolDomain(entity.getActionPool()),
            attacks,
            abilities,
            inventory,
            customSkills,
            entity.getMoney(),
            entity.getHeroPoint(),
            entity.getBiography()
        );
    }

    private Attack toAttackDomain(AttackJpaEntity e) {
        Attack a = new Attack();
        a.setId(e.getId());
        a.setName(e.getName());
        a.setDamageDice(e.getDamageDice());
        a.setDescription(e.getDescription());
        return a;
    }

    private Ability toAbilityDomain(AbilityJpaEntity e) {
        Ability ab = new Ability();
        ab.setId(e.getId());
        ab.setName(e.getName());
        ab.setCategory(e.getCategory());
        ab.setResourceType(e.getResourceType());
        ab.setActionType(e.getActionType());
        ab.setMaxUses(e.getMaxUses());
        ab.setCurrentUses(e.getCurrentUses());
        ab.setDiceRoll(e.getDiceRoll());
        ab.setDurationDice(e.getDurationDice());
        ab.setIsActive(e.getIsActive());
        ab.setTurnsRemaining(e.getTurnsRemaining());
        ab.setDescription(e.getDescription());

        List<AbilityEffect> effects = new ArrayList<>();
        if (e.getEffects() != null) {
            for (AbilityEffectJpaEntity ee : e.getEffects()) {
                AbilityEffect eff = new AbilityEffect();
                eff.setId(ee.getId());
                eff.setTargetAttribute(ee.getTargetAttribute());
                eff.setEffectValue(ee.getEffectValue());
                effects.add(eff);
            }
        }
        ab.setEffects(effects);
        return ab;
    }

    private Item toItemDomain(ItemJpaEntity e) {
        Item i = new Item();
        i.setId(e.getId());
        i.setName(e.getName());
        i.setDescription(e.getDescription());
        i.setIsEquipped(e.getIsEquipped());
        i.setTargetAttribute(e.getTargetAttribute());
        i.setEffectValue(e.getEffectValue());
        i.setQuantity(e.getQuantity());
        i.setUseDice(e.getUseDice());
        return i;
    }

    private CustomSkill toCustomSkillDomain(CustomSkillJpaEntity e) {
        CustomSkill cs = new CustomSkill();
        cs.setId(e.getId());
        cs.setName(e.getName());
        cs.setAttribute(e.getAttribute());
        cs.setValue(e.getValue());
        return cs;
    }

    private Attributes toAttributesDomain(AttributesEmbeddable e) {
        if (e == null) return null;
        Attributes a = new Attributes();
        a.setForca(e.getForca());
        a.setDestreza(e.getDestreza());
        a.setSabedoria(e.getSabedoria());
        a.setInteligencia(e.getInteligencia());
        a.setCarisma(e.getCarisma());
        a.setConstituicao(e.getConstituicao());
        return a;
    }

    private Status toStatusDomain(StatusEmbeddable e) {
        if (e == null) return null;
        Status s = new Status();
        s.setMaxHealth(e.getMaxHealth());
        s.setCurrentHealth(e.getCurrentHealth());
        s.setMaxSanity(e.getMaxSanity());
        s.setCurrentSanity(e.getCurrentSanity());
        s.setMaxMana(e.getMaxMana());
        s.setCurrentMana(e.getCurrentMana());
        s.setMaxStamina(e.getMaxStamina());
        s.setCurrentStamina(e.getCurrentStamina());
        s.setDefense(e.getDefense());
        s.setDefenseBase(e.getDefenseBase());
        s.setArmorBonus(e.getArmorBonus());
        s.setOtherBonus(e.getOtherBonus());
        s.setPhysicalRes(e.getPhysicalRes());
        s.setMagicalRes(e.getMagicalRes());
        return s;
    }

    private Expertise toExpertiseDomain(ExpertiseEmbeddable e) {
        if (e == null) return null;
        Expertise x = new Expertise();
        x.setAtletismo(e.getAtletismo());
        x.setLuta(e.getLuta());
        x.setPontaria(e.getPontaria());
        x.setReflexos(e.getReflexos());
        x.setFortitude(e.getFortitude());
        x.setFurtividade(e.getFurtividade());
        x.setConhecimento(e.getConhecimento());
        x.setInvestigacao(e.getInvestigacao());
        x.setMedicina(e.getMedicina());
        x.setMente(e.getMente());
        x.setMagia(e.getMagia());
        x.setPercepcao(e.getPercepcao());
        x.setIntuicao(e.getIntuicao());
        x.setEmpatia(e.getEmpatia());
        x.setDiplomacia(e.getDiplomacia());
        x.setIntimidar(e.getIntimidar());
        x.setLabia(e.getLabia());
        x.setSeduzir(e.getSeduzir());
        x.setConsertar(e.getConsertar());
        x.setDomar(e.getDomar());
        x.setIniciativa(e.getIniciativa());
        x.setLadinagem(e.getLadinagem());
        x.setSobrevivencia(e.getSobrevivencia());
        return x;
    }

    private ActionPool toActionPoolDomain(ActionPoolEmbeddable e) {
        if (e == null) return null;
        ActionPool p = new ActionPool();
        p.setMaxStandard(e.getMaxStandard());
        p.setCurrentStandard(e.getCurrentStandard());
        p.setMaxBonus(e.getMaxBonus());
        p.setCurrentBonus(e.getCurrentBonus());
        p.setMaxMovement(e.getMaxMovement());
        p.setCurrentMovement(e.getCurrentMovement());
        p.setMaxReaction(e.getMaxReaction());
        p.setCurrentReaction(e.getCurrentReaction());
        return p;
    }
}
