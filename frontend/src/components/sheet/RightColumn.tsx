/**
 * Coluna direita da Sheet — orchestra 9 tabs + 3 modais.
 *
 * Tabs:
 *   COMBATE — lista de ataques + botao "+ Novo Ataque"
 *   5x HABILIDADES (CLASS/MAGIC/AWAKEN/WEAPON/TRANSFORMATION/SPECIAL) —
 *     lista filtrada por categoria + botao
 *   INVENTARIO — input de dinheiro + lista de itens + botao
 *   DESCRICAO — textarea de biografia (registrada no RHF)
 *
 * Passar Turno migrou pro EffectsPanel (Fase 7) — acao fica colada
 * ao contexto dos efeitos visiveis em vez de mais um botao na coluna.
 */
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Plus, Coins, BookOpen, Sword, Sparkles, Zap, Swords, Shapes, Star, ShieldCheck, Backpack, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { playSound } from '@/lib/sound';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type {
  Ability,
  AbilityCategory,
  AbilityResource,
  ActionType,
  Attack,
  CharacterSheet,
  CustomSkill,
  InventoryItem,
  NewAbilityInput,
  NewAttackInput,
  NewItemInput,
} from '@/types/character';
import { AttackModal } from './modals/AttackModal';
import { AbilityModal } from './modals/AbilityModal';
import { ItemModal } from './modals/ItemModal';
import { CombatPanel } from './panels/CombatPanel';
import { AbilityPanel } from './panels/AbilityPanel';
import { PassivePanel } from './panels/PassivePanel';
import { InventoryPanel } from './panels/InventoryPanel';
import { useCreateAttack, useDeleteAttack, useUpdateAttack } from '@/api/attacks';
import {
  useCreateAbility,
  useDeleteAbility,
  useRecoverAbility,
  useToggleAbility,
  useUpdateAbility,
} from '@/api/abilities';
import { useCreateItem, useDeleteItem, useToggleItem, useUpdateItem } from '@/api/items';
import { rollDamage } from '@/lib/dice';
import { publishRoll } from '@/lib/rollBus';
import { POTION_TO_STATUS, type PotionTarget } from '@/lib/buffTargets';

type TabId =
  | 'COMBAT'
  | 'CLASS'
  | 'MAGIC'
  | 'AWAKEN'
  | 'WEAPON'
  | 'TRANSFORMATION'
  | 'SPECIAL'
  | 'PASSIVE'
  | 'INVENTORY'
  | 'DESCRIPTION';

interface TabDef {
  id: TabId;
  label: string;
  Icon: typeof Sword;
}

const TABS: TabDef[] = [
  { id: 'COMBAT',         label: 'Combate',        Icon: Sword },
  { id: 'CLASS',          label: 'Classe',         Icon: BookOpen },
  { id: 'MAGIC',          label: 'Magia',          Icon: Sparkles },
  { id: 'AWAKEN',         label: 'Despertar',      Icon: Zap },
  { id: 'WEAPON',         label: 'Arma',           Icon: Swords },
  { id: 'TRANSFORMATION', label: 'Transf.',        Icon: Shapes },
  { id: 'SPECIAL',        label: 'Especial',       Icon: Star },
  { id: 'PASSIVE',        label: 'Passivas',       Icon: ShieldCheck },
  { id: 'INVENTORY',      label: 'Inventario',     Icon: Backpack },
  { id: 'DESCRIPTION',    label: 'Descricao',      Icon: FileText },
];

const ABILITY_TAB_TO_CATEGORY: Record<string, AbilityCategory> = {
  CLASS: 'CLASS',
  MAGIC: 'MAGIC',
  AWAKEN: 'AWAKEN',
  WEAPON: 'WEAPON',
  TRANSFORMATION: 'TRANSFORMATION',
  SPECIAL: 'SPECIAL',
  PASSIVE: 'PASSIVE',
};

interface Props {
  characterId: string;
  attacks: Attack[];
  abilities: Ability[];
  inventory: InventoryItem[];
  customSkills: CustomSkill[];
  onRollDamage: (formula: string, source: string) => void;
}

export function RightColumn({
  characterId,
  attacks,
  abilities,
  inventory,
  customSkills,
  onRollDamage,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('COMBAT');
  const [attackModalOpen, setAttackModalOpen] = useState(false);
  const [abilityModalOpen, setAbilityModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  // editingX = null em modo create; objeto em modo edit
  const [editingAttack, setEditingAttack] = useState<Attack | null>(null);
  const [editingAbility, setEditingAbility] = useState<Ability | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Mutations
  const createAttack = useCreateAttack(characterId);
  const updateAttack = useUpdateAttack(characterId);
  const deleteAttack = useDeleteAttack(characterId);
  const createAbility = useCreateAbility(characterId);
  const updateAbility = useUpdateAbility(characterId);
  const deleteAbility = useDeleteAbility(characterId);
  const toggleAbility = useToggleAbility(characterId);
  const recoverAbility = useRecoverAbility(characterId);
  const createItem = useCreateItem(characterId);
  const updateItem = useUpdateItem(characterId);
  const deleteItem = useDeleteItem(characterId);
  const toggleItem = useToggleItem(characterId);

  const { register, control, getValues, setValue } = useFormContext<CharacterSheet>();

  // Save unico de ataque: decide create vs update baseado em editingAttack
  const handleSaveAttack = async (data: NewAttackInput) => {
    try {
      if (editingAttack) {
        await updateAttack.mutateAsync({ attackId: editingAttack.id, payload: data });
        toast.success('Ataque atualizado.');
      } else {
        await createAttack.mutateAsync(data);
        toast.success('Ataque criado.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar ataque.');
      throw e;
    }
  };

  const closeAttackModal = () => {
    setAttackModalOpen(false);
    setEditingAttack(null);
  };

  // Save unico: decide create vs update baseado em editingAbility
  const handleSaveAbility = async (data: NewAbilityInput) => {
    try {
      if (editingAbility) {
        await updateAbility.mutateAsync({ abilityId: editingAbility.id, payload: data });
        toast.success('Habilidade atualizada.');
      } else {
        await createAbility.mutateAsync(data);
        toast.success('Habilidade criada.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar habilidade.');
      throw e;
    }
  };

  const closeAbilityModal = () => {
    setAbilityModalOpen(false);
    setEditingAbility(null);
  };

  const handleSaveItem = async (data: NewItemInput) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ itemId: editingItem.id, payload: data });
        toast.success('Item atualizado.');
      } else {
        await createItem.mutateAsync(data);
        toast.success('Item criado.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar item.');
      throw e;
    }
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
  };

  /** Constroi NewItemInput a partir do item atual + overrides (qty, etc). */
  const itemToPayload = (it: InventoryItem, overrides: Partial<NewItemInput> = {}): NewItemInput => ({
    name: it.name,
    description: it.description,
    targetAttribute: it.targetAttribute,
    effectValue: it.effectValue,
    quantity: it.quantity ?? 1,
    useDice: it.useDice ?? '',
    ...overrides,
  });

  /** Ajusta quantidade do item (+1 / -1). Persiste via PUT. */
  const handleAdjustItemQty = async (itemId: string, delta: number) => {
    const it = inventory.find((i) => i.id === itemId);
    if (!it) return;
    const next = Math.max(0, (it.quantity ?? 1) + delta);
    try {
      await updateItem.mutateAsync({ itemId, payload: itemToPayload(it, { quantity: next }) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao ajustar quantidade.');
    }
  };

  /**
   * Usa pocao: rola useDice, aplica resultado a barra (cap no max), decrementa qty.
   * Aplica via setValue do form (auto-save persiste a barra). qty vai por mutation
   * dedicada — assim a UI ja reflete a queda imediatamente.
   */
  const handleUseItem = async (itemId: string) => {
    const it = inventory.find((i) => i.id === itemId);
    if (!it) return;
    const target = it.targetAttribute as PotionTarget;
    const slot = POTION_TO_STATUS[target];
    if (!slot) {
      toast.error('Item nao e uma pocao.');
      return;
    }
    if (!it.useDice) {
      toast.error('Item sem formula. Edite o item e defina ex: "2d6+1".');
      return;
    }
    const qty = it.quantity ?? 1;
    if (qty <= 0) {
      toast.error('Esgotado.');
      return;
    }

    const result = rollDamage(it.useDice, it.name || 'Pocao');
    if (!result) {
      toast.error(`Formula invalida: ${it.useDice}`);
      return;
    }
    publishRoll(result); // dispara DiceToast com animacao
    playSound('item'); // feedback imediato do uso (o som do dado vem no settle do toast)

    // Cap na barra correspondente
    const currentField = slot.current as 'status.currentHealth' | 'status.currentMana' | 'status.currentStamina';
    const maxField = slot.max as 'status.maxHealth' | 'status.maxMana' | 'status.maxStamina';
    const cur = Number(getValues(currentField)) || 0;
    const mx = Number(getValues(maxField)) || 0;
    const applied = Math.min(mx, cur + result.total);
    const gained = applied - cur;
    setValue(currentField, applied, { shouldDirty: true });

    try {
      await updateItem.mutateAsync({ itemId, payload: itemToPayload(it, { quantity: qty - 1 }) });
      toast.success(
        gained > 0
          ? `+${gained} ${slot.unit} (rolou ${result.total}${gained < result.total ? ', cap no max' : ''}).`
          : `Ja no maximo de ${slot.unit}.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao usar item.');
    }
  };

  const handleToggleAbility = async (abilityId: string, spendAs?: ActionType) => {
    const ab = abilities.find((a) => a.id === abilityId);
    if (!ab) return;
    const wasActive = ab.isActive;
    const spent: ActionType = spendAs ?? ab.actionType;

    try {
      await toggleAbility.mutateAsync({ abilityId, spendAs });

      // Sync do form local: desativar nao consome nada; ativar com FREE tampouco.
      // Decrementa o pool correspondente pra UI bater com o backend
      // (auto-save sobrescreveria o backend se nao sincronizassemos aqui).
      if (wasActive || spent === 'FREE') return;

      if (spent === 'FULL') {
        // FULL drena Padrao+Bonus+Movimento. Reacao fica intacta.
        setValue('actionPool.currentStandard', 0);
        setValue('actionPool.currentBonus', 0);
        setValue('actionPool.currentMovement', 0);
        return;
      }

      const field =
        spent === 'STANDARD' ? 'actionPool.currentStandard' as const
        : spent === 'BONUS'  ? 'actionPool.currentBonus' as const
        : spent === 'MOVEMENT' ? 'actionPool.currentMovement' as const
        : 'actionPool.currentReaction' as const;
      const cur = getValues(field) ?? 0;
      setValue(field, Math.max(0, cur - 1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao ativar habilidade.');
    }
  };

  /**
   * Espelha a fórmula do backend (AbilityServiceImpl.recoverUse): custo base 50,
   * reduzido por itens equipados com REDUCE_MANA / REDUCE_STAMINA correspondentes.
   * Single source of truth fica no backend; aqui é só pra mostrar o valor no toast.
   */
  const calcRecoverCost = (resource: AbilityResource): number => {
    if (resource === 'HYBRID') return 50; // resolved no momento da escolha — usa o valor base
    const target = resource === 'MANA' ? 'REDUCE_MANA' : 'REDUCE_STAMINA';
    const reduction = inventory
      .filter((it) => it.isEquipped && it.targetAttribute === target)
      .reduce((acc, it) => acc + (it.effectValue || 0), 0);
    return Math.max(0, 50 - reduction);
  };

  const handleRecoverAbility = async (abilityId: string, resource: AbilityResource) => {
    const cost = calcRecoverCost(resource);
    try {
      await recoverAbility.mutateAsync({ abilityId, resource });

      // Sync do form local pra refletir o debito do backend.
      // (auto-save sobrescreveria o backend se o form continuasse com o valor antigo.)
      if (resource === 'MANA') {
        const cur = getValues('status.currentMana') ?? 0;
        setValue('status.currentMana', Math.max(0, cur - cost));
      } else if (resource === 'STAMINA') {
        const cur = getValues('status.currentStamina') ?? 0;
        setValue('status.currentStamina', Math.max(0, cur - cost));
      }

      const unit = resource === 'MANA' ? 'MP' : resource === 'STAMINA' ? 'SP' : '';
      toast.success(cost > 0 ? `Uso recuperado. -${cost} ${unit}.` : 'Uso recuperado (custo zerado por itens).');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao recuperar.');
    }
  };

  // Modal context — abertura via Habilidades tabs pre-seleciona a categoria
  const abilityDefaultCategory: AbilityCategory =
    ABILITY_TAB_TO_CATEGORY[activeTab] || 'CLASS';

  return (
    <section
      style={{
        background: 'var(--bc-gradient-surface)',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {/* Tab strip */}
      <div className="bc-tabs bc-scroll">
        {TABS.map((t) => {
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`bc-tab ${activeTab === t.id ? 'bc-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              aria-selected={activeTab === t.id}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Icon size={11} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Conteudo da tab ativa */}
      <div
        className="bc-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: 16, minHeight: 0 }}
      >
        {/* COMBATE */}
        {activeTab === 'COMBAT' && (
          <>
            <SectionHead
              icon={<Sword size={14} color="#B91C1C" />}
              title="ATAQUES PREPARADOS"
              actionLabel="Novo Ataque"
              onAction={() => setAttackModalOpen(true)}
              variant="blood"
            />
            <CombatPanel
              characterId={characterId}
              attacks={attacks}
              onRoll={onRollDamage}
              onDelete={(id) => deleteAttack.mutateAsync(id)}
              onEdit={setEditingAttack}
            />
          </>
        )}

        {/* HABILIDADES (5 categorias) */}
        {(['CLASS', 'MAGIC', 'AWAKEN', 'WEAPON', 'TRANSFORMATION', 'SPECIAL'] as const).map((cat) =>
          activeTab === cat ? (
            <div key={cat}>
              <SectionHead
                icon={<Sparkles size={14} color="#D4AF37" />}
                title={`Habilidades de ${TABS.find((t) => t.id === cat)?.label}`.toUpperCase()}
                actionLabel="Adicionar"
                onAction={() => setAbilityModalOpen(true)}
              />
              <AbilityPanel
                characterId={characterId}
                category={cat}
                abilities={abilities}
                onToggle={handleToggleAbility}
                onRecover={handleRecoverAbility}
                onDelete={(id) => deleteAbility.mutateAsync(id)}
                onEdit={setEditingAbility}
                onRoll={onRollDamage}
                customSkills={customSkills}
                busy={toggleAbility.isPending || recoverAbility.isPending || deleteAbility.isPending}
              />
            </div>
          ) : null,
        )}

        {/* PASSIVAS — habilidades puramente textuais (nome + descricao) */}
        {activeTab === 'PASSIVE' && (
          <>
            <SectionHead
              icon={<ShieldCheck size={14} color="#D4AF37" />}
              title="HABILIDADES PASSIVAS"
              actionLabel="Adicionar"
              onAction={() => setAbilityModalOpen(true)}
            />
            <PassivePanel
              characterId={characterId}
              abilities={abilities}
              onDelete={(id) => deleteAbility.mutateAsync(id)}
              onEdit={setEditingAbility}
              busy={deleteAbility.isPending}
            />
          </>
        )}

        {/* INVENTARIO */}
        {activeTab === 'INVENTORY' && (
          <>
            <div className="bc-field" style={{ marginBottom: 14 }}>
              <label className="bc-field__label" htmlFor="char-money">
                Dinheiro
              </label>
              <div className="bc-input-wrap">
                <span className="bc-input-icon bc-input-icon--left" aria-hidden="true">
                  <Coins size={16} color="#F5D76E" />
                </span>
                <input
                  id="char-money"
                  {...register('money')}
                  className="bc-input bc-input--with-icon-left bc-input--sm"
                  placeholder="Ex: 100 PO"
                />
              </div>
            </div>

            <SectionHead
              icon={<Backpack size={14} color="#C8A4FF" />}
              title="MOCHILA"
              actionLabel="Novo Item"
              onAction={() => setItemModalOpen(true)}
              variant="purple"
            />
            <InventoryPanel
              characterId={characterId}
              inventory={inventory}
              onToggleEquip={(id) => toggleItem.mutateAsync(id)}
              onUse={handleUseItem}
              onAdjustQty={handleAdjustItemQty}
              onDelete={(id) => deleteItem.mutateAsync(id)}
              onEdit={setEditingItem}
              busy={toggleItem.isPending || deleteItem.isPending || updateItem.isPending}
            />
          </>
        )}

        {/* DESCRICAO — biografia com Markdown (split: textarea esquerda, preview direita) */}
        {activeTab === 'DESCRIPTION' && (
          <div className="bc-field" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <label className="bc-field__label" htmlFor="char-bio">
              Biografia & Anotacoes Permanentes (Markdown)
            </label>
            <Controller
              control={control}
              name="biography"
              render={({ field }) => (
                <MarkdownEditor
                  id="char-bio"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="# Nome do Personagem&#10;&#10;## Origem&#10;Escreva a historia aqui..."
                  rows={20}
                  mode="split"
                  minHeight={400}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* Modais */}
      <AttackModal
        isOpen={attackModalOpen || !!editingAttack}
        onClose={closeAttackModal}
        onSave={handleSaveAttack}
        attack={editingAttack ?? undefined}
        busy={createAttack.isPending || updateAttack.isPending}
      />
      <AbilityModal
        isOpen={abilityModalOpen || !!editingAbility}
        onClose={closeAbilityModal}
        onSave={handleSaveAbility}
        defaultCategory={abilityDefaultCategory}
        ability={editingAbility ?? undefined}
        customSkills={customSkills}
        busy={createAbility.isPending || updateAbility.isPending}
      />
      <ItemModal
        isOpen={itemModalOpen || !!editingItem}
        onClose={closeItemModal}
        onSave={handleSaveItem}
        item={editingItem ?? undefined}
        busy={createItem.isPending || updateItem.isPending}
      />
    </section>
  );
}

// ====== Helpers ======

function SectionHead({
  icon,
  title,
  actionLabel,
  onAction,
  variant = 'gold',
}: {
  icon: React.ReactNode;
  title: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'gold' | 'blood' | 'purple';
}) {
  const borderColors = {
    gold: 'rgba(212, 175, 55, 0.4)',
    blood: 'rgba(185, 28, 28, 0.4)',
    purple: 'rgba(157, 78, 221, 0.4)',
  };
  const textColors = {
    gold: '#D4AF37',
    blood: '#FCA5A5',
    purple: '#C8A4FF',
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <span
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600 }}
        >
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={onAction}
        style={{
          background: 'transparent',
          border: `1px solid ${borderColors[variant]}`,
          color: textColors[variant],
          padding: '6px 12px',
          fontSize: 10,
          fontFamily: 'var(--bc-font-display)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          borderRadius: 'var(--bc-radius-sm)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Plus size={11} />
        {actionLabel}
      </button>
    </div>
  );
}

