package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.ArrayList;
import java.util.List;

import br.com.henrique.bloodcrown_cs.domain.character.enums.AbilityCategory;
import br.com.henrique.bloodcrown_cs.domain.character.enums.ActionType;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.Getter;

/**
 * Raiz do agregado de ficha de personagem. Dona dos value objects (atributos, status,
 * perícias, pool de ações) e das sub-entidades (ataques, habilidades, itens, perícias
 * customizadas). Toda regra de jogo — descanso, avançar turno, ativar habilidade,
 * recuperar uso, equipar item, CRUD de filhos, update/patch da ficha — é método de
 * domínio aqui, mantendo a lógica isolada de framework e centralizada na raiz.
 */
@Getter
public class Character {

    private final String id;
    private final String ownerUserId;
    private String folderId;

    private String name;
    private String characterClass;
    private Integer level;

    private final Attributes attributes;
    private final Status status;
    private final Expertise expertise;
    private ActionPool actionPool;

    private final List<Attack> attacks;
    private final List<Ability> abilities;
    private final List<Item> inventory;
    private final List<CustomSkill> customSkills;

    private String money;
    private Integer heroPoint;
    private String biography;

    /**
     * Construtor de reconstituição — usado pelo mapper de persistência. Listas null
     * viram vazias para blindar contra registros legados.
     */
    public Character(String id, String ownerUserId, String folderId, String name, String characterClass,
                     Integer level, Attributes attributes, Status status, Expertise expertise,
                     ActionPool actionPool, List<Attack> attacks, List<Ability> abilities,
                     List<Item> inventory, List<CustomSkill> customSkills, String money,
                     Integer heroPoint, String biography) {
        this.id = id;
        this.ownerUserId = ownerUserId;
        this.folderId = folderId;
        this.name = name;
        this.characterClass = characterClass;
        this.level = level;
        this.attributes = attributes;
        this.status = status;
        this.expertise = expertise;
        this.actionPool = actionPool;
        this.attacks = attacks != null ? attacks : new ArrayList<>();
        this.abilities = abilities != null ? abilities : new ArrayList<>();
        this.inventory = inventory != null ? inventory : new ArrayList<>();
        this.customSkills = customSkills != null ? customSkills : new ArrayList<>();
        this.money = money;
        this.heroPoint = heroPoint;
        this.biography = biography;
    }

    /**
     * Cria uma ficha nova com os mesmos defaults do antigo createCharacter:
     * atributos/perícias zerados, recursos vitais em 10, defesa 10/10 e pool padrão.
     */
    public static Character createNew(String ownerUserId) {
        Attributes attr = new Attributes();
        attr.setForca(0); attr.setDestreza(0); attr.setConstituicao(0);
        attr.setInteligencia(0); attr.setSabedoria(0); attr.setCarisma(0);

        Status status = new Status();
        status.setMaxHealth(10);  status.setCurrentHealth(10);
        status.setMaxSanity(10);  status.setCurrentSanity(10);
        status.setMaxMana(10);    status.setCurrentMana(10);
        status.setMaxStamina(10); status.setCurrentStamina(10);
        status.setDefense(10);    status.setDefenseBase(10);
        status.setArmorBonus(0);  status.setOtherBonus(0);

        Expertise exp = new Expertise();
        exp.setAtletismo(0); exp.setConhecimento(0); exp.setConsertar(0); exp.setDiplomacia(0);
        exp.setDomar(0); exp.setEmpatia(0); exp.setFortitude(0); exp.setFurtividade(0);
        exp.setMagia(0); exp.setIniciativa(0); exp.setIntimidar(0); exp.setIntuicao(0);
        exp.setInvestigacao(0); exp.setLabia(0); exp.setLadinagem(0); exp.setLuta(0);
        exp.setMedicina(0); exp.setMente(0); exp.setPercepcao(0); exp.setPontaria(0);
        exp.setReflexos(0); exp.setSeduzir(0); exp.setSobrevivencia(0);

        return new Character(
            java.util.UUID.randomUUID().toString(), ownerUserId, null,
            "Novo Personagem", "", 1,
            attr, status, exp, ActionPool.padrao(),
            new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(),
            null, null, null
        );
    }

    // ----------------------------------------------------------------------------
    // Retrocompat
    // ----------------------------------------------------------------------------

    /**
     * Garante actionPool com valores não-null. Hibernate instancia o @Embedded mesmo
     * com todas as colunas NULL (fichas pré-feature), então checar só `== null` não basta.
     */
    public void ensureActionPool() {
        if (actionPool == null || actionPool.getMaxStandard() == null) {
            this.actionPool = ActionPool.padrao();
        }
    }

    // ----------------------------------------------------------------------------
    // Ações de jogo
    // ----------------------------------------------------------------------------

    /** Descanso longo: restaura recursos ao máximo, zera usos/cooldowns e reseta o pool. */
    public void rest() {
        if (status != null) {
            status.setCurrentHealth(status.getMaxHealth());
            status.setCurrentMana(status.getMaxMana());
            status.setCurrentSanity(status.getMaxSanity());
            status.setCurrentStamina(status.getMaxStamina());
        }
        for (Ability ability : abilities) {
            if (ability.getMaxUses() != null) {
                ability.setCurrentUses(ability.getMaxUses());
            }
            ability.setIsActive(false);
            ability.setTurnsRemaining(0);
        }
        ensureActionPool();
        actionPool.setCurrentStandard(actionPool.getMaxStandard());
        actionPool.setCurrentBonus(actionPool.getMaxBonus());
        actionPool.setCurrentMovement(actionPool.getMaxMovement());
        actionPool.setCurrentReaction(actionPool.getMaxReaction());
    }

    /** Avança o turno: decrementa cooldowns das habilidades ativas e reseta o pool aos máximos. */
    public void advanceTurn() {
        for (Ability ability : abilities) {
            if (Boolean.TRUE.equals(ability.getIsActive())
                    && ability.getTurnsRemaining() != null && ability.getTurnsRemaining() > 0) {
                int newValue = ability.getTurnsRemaining() - 1;
                ability.setTurnsRemaining(newValue);
                if (newValue <= 0) {
                    ability.setIsActive(false);
                    ability.setTurnsRemaining(0);
                }
            }
        }
        ensureActionPool();
        actionPool.setCurrentStandard(actionPool.getMaxStandard());
        actionPool.setCurrentBonus(actionPool.getMaxBonus());
        actionPool.setCurrentMovement(actionPool.getMaxMovement());
        actionPool.setCurrentReaction(actionPool.getMaxReaction());
    }

    /**
     * Alterna a ativação de uma habilidade. Ao ativar: valida usos, resolve o tipo de
     * ação (com substituição D&D-like), consome o pool, debita 1 uso e calcula duração.
     *
     * @param spendAs tipo de ação a gastar; null = usa o actionType da habilidade.
     */
    public void toggleAbility(String abilityId, ActionType spendAs) {
        Ability ability = findAbility(abilityId);

        if (ability.getCategory() == AbilityCategory.PASSIVE) {
            throw new BadRequestException("Habilidades passivas não são ativáveis.");
        }

        boolean isActivating = !Boolean.TRUE.equals(ability.getIsActive());
        boolean unlimited = ability.getMaxUses() == null || ability.getMaxUses() <= 0;

        if (isActivating) {
            if (!unlimited && (ability.getCurrentUses() == null || ability.getCurrentUses() <= 0)) {
                throw new BadRequestException("Sem usos disponíveis para ativar esta habilidade!");
            }

            ActionType required = ActionType.fromString(ability.getActionType());
            ActionType spent = spendAs != null ? spendAs : required;

            if (!spent.canSubstitute(required)) {
                throw new BadRequestException("Ação " + spent + " não pode substituir " + required + ".");
            }

            consumeFromPool(spent);

            if (!unlimited) {
                ability.setCurrentUses(ability.getCurrentUses() - 1);
            }
            ability.setIsActive(true);
            if (ability.getDurationDice() != null && !ability.getDurationDice().isBlank()) {
                ability.setTurnsRemaining(rollDice(ability.getDurationDice()));
            } else {
                ability.setTurnsRemaining(null);
            }
        } else {
            ability.setIsActive(false);
            ability.setTurnsRemaining(0);
        }
    }

    /**
     * Recupera 1 uso de uma habilidade gastando 50 de Mana/Estamina (reduzido por itens
     * equipados REDUCE_MANA/REDUCE_STAMINA). resourceToSpend só importa pra habilidades híbridas.
     */
    public void recoverAbilityUse(String abilityId, String resourceToSpend) {
        Ability ability = findAbility(abilityId);

        Integer max = ability.getMaxUses();
        if (max == null || max <= 0 || (ability.getCurrentUses() != null && ability.getCurrentUses() >= max)) {
            throw new BadRequestException("Os usos já estão cheios!");
        }

        boolean spendMana = false;
        boolean spendStamina = false;

        switch (ability.getResourceType()) {
            case MANA -> spendMana = true;
            case STAMINA -> spendStamina = true;
            case HYBRID -> {
                if ("MANA".equalsIgnoreCase(resourceToSpend)) spendMana = true;
                else if ("STAMINA".equalsIgnoreCase(resourceToSpend)) spendStamina = true;
                else throw new BadRequestException("Para habilidades híbridas, especifique MANA ou STAMINA.");
            }
        }

        int reduction = 0;
        for (Item item : inventory) {
            if (Boolean.TRUE.equals(item.getIsEquipped())) {
                if ("REDUCE_MANA".equals(item.getTargetAttribute()) && spendMana) {
                    reduction += (item.getEffectValue() != null ? item.getEffectValue() : 0);
                }
                if ("REDUCE_STAMINA".equals(item.getTargetAttribute()) && spendStamina) {
                    reduction += (item.getEffectValue() != null ? item.getEffectValue() : 0);
                }
            }
        }

        int cost = Math.max(0, 50 - reduction);

        if (spendMana) {
            if (status.getCurrentMana() < cost) {
                throw new BadRequestException("Mana insuficiente!");
            }
            status.setCurrentMana(status.getCurrentMana() - cost);
        } else if (spendStamina) {
            if (status.getCurrentStamina() < cost) {
                throw new BadRequestException("Estamina insuficiente!");
            }
            status.setCurrentStamina(status.getCurrentStamina() - cost);
        }

        ability.setCurrentUses(ability.getCurrentUses() + 1);
    }

    /** Alterna o estado equipado de um item. */
    public void toggleItemEquip(String itemId) {
        Item item = findItem(itemId);
        item.setIsEquipped(!Boolean.TRUE.equals(item.getIsEquipped()));
    }

    /**
     * Decrementa 1 do contador correspondente no pool. FREE não consome.
     * FULL drena Padrão+Bônus+Movimento (exige todos intactos). Lança se zerado.
     */
    private void consumeFromPool(ActionType type) {
        if (type == ActionType.FREE) return;

        ensureActionPool();
        ActionPool pool = this.actionPool;

        switch (type) {
            case STANDARD -> {
                if (pool.getCurrentStandard() == null || pool.getCurrentStandard() <= 0) {
                    throw new BadRequestException("Sem Ação Padrão disponível no turno.");
                }
                pool.setCurrentStandard(pool.getCurrentStandard() - 1);
            }
            case BONUS -> {
                if (pool.getCurrentBonus() == null || pool.getCurrentBonus() <= 0) {
                    throw new BadRequestException("Sem Ação Bônus disponível no turno.");
                }
                pool.setCurrentBonus(pool.getCurrentBonus() - 1);
            }
            case MOVEMENT -> {
                if (pool.getCurrentMovement() == null || pool.getCurrentMovement() <= 0) {
                    throw new BadRequestException("Sem Ação de Movimento disponível no turno.");
                }
                pool.setCurrentMovement(pool.getCurrentMovement() - 1);
            }
            case REACTION -> {
                if (pool.getCurrentReaction() == null || pool.getCurrentReaction() <= 0) {
                    throw new BadRequestException("Sem Reação disponível no turno.");
                }
                pool.setCurrentReaction(pool.getCurrentReaction() - 1);
            }
            case FULL -> {
                if (!isCategoryIntact(pool.getCurrentStandard(), pool.getMaxStandard())
                        || !isCategoryIntact(pool.getCurrentBonus(), pool.getMaxBonus())
                        || !isCategoryIntact(pool.getCurrentMovement(), pool.getMaxMovement())) {
                    throw new BadRequestException(
                        "Ação Completa exige que nenhuma outra ação tenha sido usada neste turno.");
                }
                if (pool.getMaxStandard() != null) pool.setCurrentStandard(0);
                if (pool.getMaxBonus() != null) pool.setCurrentBonus(0);
                if (pool.getMaxMovement() != null) pool.setCurrentMovement(0);
            }
            case FREE -> { /* noop — já filtrado acima */ }
        }
    }

    /** Pool intacto pra essa categoria (current == max, ou max null/0). */
    private boolean isCategoryIntact(Integer current, Integer max) {
        if (max == null || max == 0) return true;
        return current != null && current.intValue() == max.intValue();
    }

    /**
     * Interpreta e rola uma fórmula de dados (ex: "1d6+3") usando Math.random.
     * Em erro de parsing devolve 1 (mesma defesa do código original).
     */
    private int rollDice(String formula) {
        try {
            String clean = formula.toLowerCase().replace(" ", "");
            if (clean.matches("\\d+")) return Integer.parseInt(clean);
            if (clean.contains("d")) {
                String[] parts = clean.split("[d\\+\\-]");
                int count = Integer.parseInt(parts[0]);
                int faces = Integer.parseInt(parts[1]);
                int total = 0;
                for (int i = 0; i < count; i++) {
                    total += (int) (Math.random() * faces) + 1;
                }
                if (clean.contains("+")) {
                    total += Integer.parseInt(clean.substring(clean.indexOf("+") + 1));
                }
                return total;
            }
            return 0;
        } catch (Exception e) {
            return 1;
        }
    }

    // ----------------------------------------------------------------------------
    // Ataques
    // ----------------------------------------------------------------------------

    public Attack addAttack(String name, String damageDice, String description) {
        Attack attack = Attack.create(name, damageDice, description);
        attacks.add(attack);
        return attack;
    }

    public Attack updateAttack(String attackId, String name, String damageDice, String description) {
        Attack attack = findAttack(attackId);
        attack.setName(name);
        attack.setDamageDice(damageDice);
        attack.setDescription(description);
        return attack;
    }

    public void removeAttack(String attackId) {
        attacks.remove(findAttack(attackId));
    }

    // ----------------------------------------------------------------------------
    // Habilidades
    // ----------------------------------------------------------------------------

    /**
     * Adiciona uma habilidade a partir de um rascunho (já com id gerado). Uma habilidade
     * nasce com usos cheios e inativa; passivas são normalizadas (sem usos/turnos/efeitos).
     */
    public Ability addAbility(Ability draft) {
        draft.setCurrentUses(draft.getMaxUses());
        draft.setIsActive(false);
        draft.setTurnsRemaining(0);
        applyPassiveRules(draft);
        abilities.add(draft);
        return draft;
    }

    /**
     * Atualiza a definição de uma habilidade preservando o estado de runtime
     * (currentUses/isActive/turnsRemaining), com cap de usos e substituição integral
     * da lista de efeitos. Reabastece usos ao converter passiva -> ativa.
     */
    public Ability updateAbility(String abilityId, Ability draft) {
        Ability ability = findAbility(abilityId);
        boolean wasPassive = ability.getCategory() == AbilityCategory.PASSIVE;

        ability.setName(draft.getName());
        ability.setCategory(draft.getCategory());
        ability.setActionType(draft.getActionType());
        ability.setDiceRoll(draft.getDiceRoll());
        ability.setDurationDice(draft.getDurationDice());
        ability.setDescription(draft.getDescription());
        ability.setResourceType(draft.getResourceType());

        if (draft.getCategory() == AbilityCategory.PASSIVE) {
            applyPassiveRules(ability);
        } else {
            Integer newMax = draft.getMaxUses();
            ability.setMaxUses(newMax);
            if (newMax != null && ability.getCurrentUses() != null && ability.getCurrentUses() > newMax) {
                ability.setCurrentUses(newMax);
            }
            if (wasPassive) {
                ability.setCurrentUses(draft.getMaxUses());
                ability.setTurnsRemaining(0);
            }
        }

        ability.getEffects().clear();
        if (draft.getCategory() != AbilityCategory.PASSIVE && draft.getEffects() != null) {
            for (AbilityEffect eff : draft.getEffects()) {
                ability.getEffects().add(AbilityEffect.create(eff.getTargetAttribute(), eff.getEffectValue()));
            }
        }
        return ability;
    }

    public void removeAbility(String abilityId) {
        abilities.remove(findAbility(abilityId));
    }

    /** Habilidade passiva: puramente textual, sem usos/turnos/custo de ação/efeitos. */
    private void applyPassiveRules(Ability ability) {
        if (ability.getCategory() == AbilityCategory.PASSIVE) {
            ability.setIsActive(false);
            ability.setMaxUses(0);
            ability.setCurrentUses(0);
            ability.setTurnsRemaining(null);
            ability.setActionType("FREE");
            ability.setDurationDice(null);
            ability.getEffects().clear();
        }
    }

    // ----------------------------------------------------------------------------
    // Itens
    // ----------------------------------------------------------------------------

    public Item addItem(String name, String description, String targetAttribute,
                        Integer effectValue, Integer quantity, String useDice) {
        Item item = Item.create(name, description, targetAttribute, effectValue, quantity, useDice);
        inventory.add(item);
        return item;
    }

    public Item updateItem(String itemId, String name, String description, String targetAttribute,
                           Integer effectValue, Integer quantity, String useDice) {
        Item item = findItem(itemId);
        item.setName(name);
        item.setDescription(description);
        item.setTargetAttribute(targetAttribute);
        item.setEffectValue(effectValue);
        if (quantity != null) item.setQuantity(Math.max(0, quantity));
        item.setUseDice(useDice);
        // isEquipped preservado — toggle é via endpoint dedicado.
        return item;
    }

    public void removeItem(String itemId) {
        inventory.remove(findItem(itemId));
    }

    // ----------------------------------------------------------------------------
    // Perícias customizadas
    // ----------------------------------------------------------------------------

    public CustomSkill addCustomSkill(String name, String attribute, Integer value) {
        CustomSkill skill = CustomSkill.create(name, attribute, value);
        customSkills.add(skill);
        return skill;
    }

    public CustomSkill updateCustomSkill(String customSkillId, String name, String attribute, Integer value) {
        CustomSkill skill = findCustomSkill(customSkillId);
        skill.setName(name);
        skill.setAttribute(attribute);
        skill.setValue(value);
        return skill;
    }

    public void removeCustomSkill(String customSkillId) {
        customSkills.remove(findCustomSkill(customSkillId));
    }

    // ----------------------------------------------------------------------------
    // Pasta
    // ----------------------------------------------------------------------------

    /** Move a ficha pra uma pasta (null/vazio = raiz). Ownership da pasta é validada no use case. */
    public void moveToFolder(String folderId) {
        this.folderId = (folderId == null || folderId.isBlank()) ? null : folderId;
    }

    // ----------------------------------------------------------------------------
    // Update (PUT) e Patch (PATCH) da ficha
    // ----------------------------------------------------------------------------

    /**
     * Atualização completa (PUT). Escalares são sobrescritos; sub-objetos null são
     * ignorados; dentro de status/pool, maxes null são ignorados e os currents são
     * capados em [0, max].
     */
    public void applyFullUpdate(String name, String characterClass, Integer level, String money,
                                Integer heroPoint, String biography, Attributes incomingAttributes,
                                Status incomingStatus, Expertise incomingExpertise, ActionPool incomingActionPool) {
        this.name = name;
        this.characterClass = characterClass;
        this.level = level;
        this.money = money;
        this.heroPoint = heroPoint;
        this.biography = biography;

        if (incomingAttributes != null) {
            attributes.setForca(incomingAttributes.getForca());
            attributes.setDestreza(incomingAttributes.getDestreza());
            attributes.setConstituicao(incomingAttributes.getConstituicao());
            attributes.setInteligencia(incomingAttributes.getInteligencia());
            attributes.setSabedoria(incomingAttributes.getSabedoria());
            attributes.setCarisma(incomingAttributes.getCarisma());
        }

        if (incomingStatus != null) {
            applyStatusMaxesAndDefenses(incomingStatus);
            capCurrentVitals(incomingStatus);
        }

        if (incomingActionPool != null) {
            applyActionPool(incomingActionPool);
        }

        if (incomingExpertise != null) {
            Expertise e = incomingExpertise;
            expertise.setAtletismo(e.getAtletismo());
            expertise.setConhecimento(e.getConhecimento());
            expertise.setConsertar(e.getConsertar());
            expertise.setDiplomacia(e.getDiplomacia());
            expertise.setDomar(e.getDomar());
            expertise.setEmpatia(e.getEmpatia());
            expertise.setFortitude(e.getFortitude());
            expertise.setFurtividade(e.getFurtividade());
            expertise.setMagia(e.getMagia());
            expertise.setIniciativa(e.getIniciativa());
            expertise.setIntimidar(e.getIntimidar());
            expertise.setIntuicao(e.getIntuicao());
            expertise.setInvestigacao(e.getInvestigacao());
            expertise.setLabia(e.getLabia());
            expertise.setLadinagem(e.getLadinagem());
            expertise.setLuta(e.getLuta());
            expertise.setMedicina(e.getMedicina());
            expertise.setMente(e.getMente());
            expertise.setPercepcao(e.getPercepcao());
            expertise.setPontaria(e.getPontaria());
            expertise.setReflexos(e.getReflexos());
            expertise.setSeduzir(e.getSeduzir());
            expertise.setSobrevivencia(e.getSobrevivencia());
        }
    }

    /**
     * Patch parcial (PATCH). Cada campo (inclusive escalares e campos internos dos
     * sub-objetos) só é aplicado quando não-null; currents são capados em [0, max].
     */
    public void applyPatch(String name, String characterClass, Integer level, String money,
                           Integer heroPoint, String biography, Attributes incomingAttributes,
                           Status incomingStatus, Expertise incomingExpertise, ActionPool incomingActionPool) {
        if (name != null) this.name = name;
        if (characterClass != null) this.characterClass = characterClass;
        if (level != null) this.level = level;
        if (money != null) this.money = money;
        if (heroPoint != null) this.heroPoint = heroPoint;
        if (biography != null) this.biography = biography;

        if (incomingAttributes != null) {
            Attributes a = incomingAttributes;
            if (a.getForca() != null) attributes.setForca(a.getForca());
            if (a.getDestreza() != null) attributes.setDestreza(a.getDestreza());
            if (a.getConstituicao() != null) attributes.setConstituicao(a.getConstituicao());
            if (a.getInteligencia() != null) attributes.setInteligencia(a.getInteligencia());
            if (a.getSabedoria() != null) attributes.setSabedoria(a.getSabedoria());
            if (a.getCarisma() != null) attributes.setCarisma(a.getCarisma());
        }

        if (incomingStatus != null) {
            applyStatusMaxesAndDefenses(incomingStatus);
            capCurrentVitals(incomingStatus);
        }

        if (incomingActionPool != null) {
            applyActionPool(incomingActionPool);
        }

        if (incomingExpertise != null) {
            Expertise e = incomingExpertise;
            if (e.getAtletismo() != null) expertise.setAtletismo(e.getAtletismo());
            if (e.getConhecimento() != null) expertise.setConhecimento(e.getConhecimento());
            if (e.getConsertar() != null) expertise.setConsertar(e.getConsertar());
            if (e.getDiplomacia() != null) expertise.setDiplomacia(e.getDiplomacia());
            if (e.getDomar() != null) expertise.setDomar(e.getDomar());
            if (e.getEmpatia() != null) expertise.setEmpatia(e.getEmpatia());
            if (e.getFortitude() != null) expertise.setFortitude(e.getFortitude());
            if (e.getFurtividade() != null) expertise.setFurtividade(e.getFurtividade());
            if (e.getMagia() != null) expertise.setMagia(e.getMagia());
            if (e.getIniciativa() != null) expertise.setIniciativa(e.getIniciativa());
            if (e.getIntimidar() != null) expertise.setIntimidar(e.getIntimidar());
            if (e.getIntuicao() != null) expertise.setIntuicao(e.getIntuicao());
            if (e.getInvestigacao() != null) expertise.setInvestigacao(e.getInvestigacao());
            if (e.getLabia() != null) expertise.setLabia(e.getLabia());
            if (e.getLadinagem() != null) expertise.setLadinagem(e.getLadinagem());
            if (e.getLuta() != null) expertise.setLuta(e.getLuta());
            if (e.getMedicina() != null) expertise.setMedicina(e.getMedicina());
            if (e.getMente() != null) expertise.setMente(e.getMente());
            if (e.getPercepcao() != null) expertise.setPercepcao(e.getPercepcao());
            if (e.getPontaria() != null) expertise.setPontaria(e.getPontaria());
            if (e.getReflexos() != null) expertise.setReflexos(e.getReflexos());
            if (e.getSeduzir() != null) expertise.setSeduzir(e.getSeduzir());
            if (e.getSobrevivencia() != null) expertise.setSobrevivencia(e.getSobrevivencia());
        }
    }

    /** Aplica maxes (quando não-null) e defesas/resistências (quando não-null) ao status. */
    private void applyStatusMaxesAndDefenses(Status incoming) {
        if (incoming.getMaxHealth() != null) status.setMaxHealth(incoming.getMaxHealth());
        if (incoming.getMaxMana() != null) status.setMaxMana(incoming.getMaxMana());
        if (incoming.getMaxSanity() != null) status.setMaxSanity(incoming.getMaxSanity());
        if (incoming.getMaxStamina() != null) status.setMaxStamina(incoming.getMaxStamina());
        if (incoming.getDefense() != null) status.setDefense(incoming.getDefense());
        if (incoming.getDefenseBase() != null) status.setDefenseBase(incoming.getDefenseBase());
        if (incoming.getArmorBonus() != null) status.setArmorBonus(incoming.getArmorBonus());
        if (incoming.getOtherBonus() != null) status.setOtherBonus(incoming.getOtherBonus());
        if (incoming.getPhysicalRes() != null) status.setPhysicalRes(incoming.getPhysicalRes());
        if (incoming.getMagicalRes() != null) status.setMagicalRes(incoming.getMagicalRes());
    }

    /** Capa cada current vital em [0, max] quando o current vem no payload e o max existe. */
    private void capCurrentVitals(Status incoming) {
        if (incoming.getCurrentHealth() != null && status.getMaxHealth() != null) {
            status.setCurrentHealth(Math.max(0, Math.min(incoming.getCurrentHealth(), status.getMaxHealth())));
        }
        if (incoming.getCurrentMana() != null && status.getMaxMana() != null) {
            status.setCurrentMana(Math.max(0, Math.min(incoming.getCurrentMana(), status.getMaxMana())));
        }
        if (incoming.getCurrentSanity() != null && status.getMaxSanity() != null) {
            status.setCurrentSanity(Math.max(0, Math.min(incoming.getCurrentSanity(), status.getMaxSanity())));
        }
        if (incoming.getCurrentStamina() != null && status.getMaxStamina() != null) {
            status.setCurrentStamina(Math.max(0, Math.min(incoming.getCurrentStamina(), status.getMaxStamina())));
        }
    }

    /** Aplica maxes (quando não-null) e capa currents do pool de ações. */
    private void applyActionPool(ActionPool incoming) {
        ensureActionPool();
        ActionPool pool = this.actionPool;
        if (incoming.getMaxStandard() != null) pool.setMaxStandard(incoming.getMaxStandard());
        if (incoming.getMaxBonus() != null) pool.setMaxBonus(incoming.getMaxBonus());
        if (incoming.getMaxMovement() != null) pool.setMaxMovement(incoming.getMaxMovement());
        if (incoming.getMaxReaction() != null) pool.setMaxReaction(incoming.getMaxReaction());

        if (incoming.getCurrentStandard() != null && pool.getMaxStandard() != null) {
            pool.setCurrentStandard(Math.max(0, Math.min(incoming.getCurrentStandard(), pool.getMaxStandard())));
        }
        if (incoming.getCurrentBonus() != null && pool.getMaxBonus() != null) {
            pool.setCurrentBonus(Math.max(0, Math.min(incoming.getCurrentBonus(), pool.getMaxBonus())));
        }
        if (incoming.getCurrentMovement() != null && pool.getMaxMovement() != null) {
            pool.setCurrentMovement(Math.max(0, Math.min(incoming.getCurrentMovement(), pool.getMaxMovement())));
        }
        if (incoming.getCurrentReaction() != null && pool.getMaxReaction() != null) {
            pool.setCurrentReaction(Math.max(0, Math.min(incoming.getCurrentReaction(), pool.getMaxReaction())));
        }
    }

    // ----------------------------------------------------------------------------
    // Finders internos
    // ----------------------------------------------------------------------------

    private Ability findAbility(String abilityId) {
        return abilities.stream().filter(a -> a.getId().equals(abilityId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Habilidade não encontrada."));
    }

    private Attack findAttack(String attackId) {
        return attacks.stream().filter(a -> a.getId().equals(attackId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Ataque não encontrado."));
    }

    private Item findItem(String itemId) {
        return inventory.stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
    }

    private CustomSkill findCustomSkill(String customSkillId) {
        return customSkills.stream().filter(s -> s.getId().equals(customSkillId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Perícia não encontrada."));
    }
}
