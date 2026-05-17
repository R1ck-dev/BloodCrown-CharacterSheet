/**
 * Tipos do dominio Character — mapeiam 1:1 os DTOs Java do backend.
 * Manter sincronizado com:
 *   backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/
 */

export type AbilityCategory =
  | 'CLASS'
  | 'MAGIC'
  | 'AWAKEN'
  | 'WEAPON'
  | 'TRANSFORMATION'
  | 'SPECIAL'
  | 'INVENTORY';

export type AbilityResource = 'MANA' | 'STAMINA' | 'HYBRID';

export type ActionType = 'STANDARD' | 'BONUS' | 'MOVEMENT' | 'REACTION' | 'FREE' | 'FULL';

export interface ActionPool {
  maxStandard: number;
  currentStandard: number;
  maxBonus: number;
  currentBonus: number;
  maxMovement: number;
  currentMovement: number;
  maxReaction: number;
  currentReaction: number;
}

export interface Attributes {
  forca: number;
  destreza: number;
  sabedoria: number;
  inteligencia: number;
  carisma: number;
  constituicao: number;
}

export interface Status {
  maxHealth: number;
  currentHealth: number;
  maxSanity: number;
  currentSanity: number;
  maxMana: number;
  currentMana: number;
  maxStamina: number;
  currentStamina: number;
  defense: number;
  defenseBase: number;
  armorBonus: number;
  otherBonus: number;
  physicalRes: number;
  magicalRes: number;
}

export interface Expertise {
  atletismo: number;
  conhecimento: number;
  consertar: number;
  diplomacia: number;
  domar: number;
  empatia: number;
  fortitude: number;
  furtividade: number;
  magia: number;
  iniciativa: number;
  intimidar: number;
  intuicao: number;
  investigacao: number;
  labia: number;
  ladinagem: number;
  luta: number;
  medicina: number;
  mente: number;
  percepcao: number;
  pontaria: number;
  reflexos: number;
  seduzir: number;
  sobrevivencia: number;
}

export interface Attack {
  id: string;
  name: string;
  damageDice: string;
  description: string;
}

export interface Effect {
  target: string;
  value: number;
}

export interface Ability {
  id: string;
  name: string;
  category: AbilityCategory;
  resourceType: AbilityResource;
  /** Tipo de acao consumida ao ativar. Backend normaliza strings legadas pro enum. */
  actionType: ActionType;
  maxUses: number;
  currentUses: number;
  diceRoll: string;
  effects: Effect[];
  durationDice: string;
  isActive: boolean;
  turnsRemaining: number | null;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  isEquipped: boolean;
  targetAttribute: string;
  effectValue: number;
  /** Quantidade na mochila (consumíveis empilhados). Default 1, 0 = esgotado. */
  quantity: number;
  /** Fórmula rolada ao "Usar" (poções: ex "2d6+3"). Combina com targetAttribute
   *  RESTORE_HP/MANA/STAMINA pra recuperar a barra correspondente. */
  useDice: string;
}

/** Resposta de GET /characters (listagem resumida) */
export interface CharacterSummary {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  attacks: Attack[];
  /** Pode ser null em personagens legados sem status — defender no render */
  currentHealth: number | null;
  maxHealth: number | null;
  /** ID da pasta onde a ficha está. Null = raiz. */
  folderId: string | null;
}

/** Pasta de organização de fichas (estrutura flat). */
export interface Folder {
  id: string;
  name: string;
}

export interface NewFolderInput {
  name: string;
}

/** Resposta de GET /characters/{id} e payload de PUT /characters/{id} */
export interface CharacterSheet {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  attributes: Attributes;
  status: Status;
  expertise: Expertise;
  attacks: Attack[];
  abilities: Ability[];
  inventory: InventoryItem[];
  money: string;
  heroPoint: number;
  biography: string;
  /** Pool de acoes por turno. Pode vir null em personagens muito antigos (backend defaulta). */
  actionPool: ActionPool;
}

/** Input do modal de novo ataque */
export interface NewAttackInput {
  name: string;
  damageDice: string;
  description: string;
}

/** Input do modal de nova habilidade */
export interface NewAbilityInput {
  name: string;
  category: AbilityCategory;
  resourceType: AbilityResource;
  actionType: ActionType;
  maxUses: number;
  diceRoll: string;
  effects: Effect[];
  durationDice: string;
  description: string;
}

/** Input do modal de novo item */
export interface NewItemInput {
  name: string;
  description: string;
  targetAttribute: string;
  effectValue: number;
  quantity: number;
  useDice: string;
}
