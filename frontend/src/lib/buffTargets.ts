/**
 * Mapeamento de target strings opacas (contrato com backend) -> form field paths.
 *
 * Backend persiste effects como { target: string, value: number } sem validacao
 * de schema — o frontend dita o vocabulario. Strings legadas: attrForca,
 * skillLuta, defOther, resPhysical, REDUCE_MANA, etc.
 *
 * Mapeamos pra paths do CharacterSheet (attributes.forca, expertise.luta,
 * status.otherBonus, etc.) que sao usados pelo RHF e pela exibicao de buffs
 * visuais (medallion buffed, valor verde, etc.).
 */
import type { Attributes, Expertise, Status } from '@/types/character';

export const ATTR_TARGETS = [
  'attrForca',
  'attrDestreza',
  'attrConstituicao',
  'attrInteligencia',
  'attrSabedoria',
  'attrCarisma',
] as const;

export const SKILL_TARGETS = [
  'skillAtletismo',
  'skillConhecimento',
  'skillConsertar',
  'skillDiplomacia',
  'skillDomar',
  'skillEmpatia',
  'skillFortitude',
  'skillFurtividade',
  'skillMagia',
  'skillIniciativa',
  'skillIntimidar',
  'skillIntuicao',
  'skillInvestigacao',
  'skillLabia',
  'skillLadinagem',
  'skillLuta',
  'skillMedicina',
  'skillMente',
  'skillPercepcao',
  'skillPontaria',
  'skillReflexos',
  'skillSeduzir',
  'skillSobrevivencia',
] as const;

export const STATUS_TARGETS = [
  'defArmor',
  'defOther',
  'resPhysical',
  'resMagical',
] as const;

/** Targets de economia — reduzem custo de habilidade, nao somam em campo do form */
export const ECONOMY_TARGETS = ['REDUCE_MANA', 'REDUCE_STAMINA'] as const;

/** Targets de pocao — ao "Usar" o item, rolam useDice e aplicam a barra (cap no max) */
export const POTION_TARGETS = ['RESTORE_HP', 'RESTORE_MANA', 'RESTORE_STAMINA'] as const;
export type PotionTarget = (typeof POTION_TARGETS)[number];

/** Mapa pocao -> par de campos do form (current/max) usado pelo handler de Usar */
export const POTION_TO_STATUS: Record<PotionTarget, { current: string; max: string; unit: string }> = {
  RESTORE_HP:      { current: 'status.currentHealth',  max: 'status.maxHealth',  unit: 'HP' },
  RESTORE_MANA:    { current: 'status.currentMana',    max: 'status.maxMana',    unit: 'MP' },
  RESTORE_STAMINA: { current: 'status.currentStamina', max: 'status.maxStamina', unit: 'SP' },
};

export type AttrTarget = (typeof ATTR_TARGETS)[number];
export type SkillTarget = (typeof SKILL_TARGETS)[number];
export type StatusTarget = (typeof STATUS_TARGETS)[number];
export type EconomyTarget = (typeof ECONOMY_TARGETS)[number];

/** Converte target opaque em form path RHF (ou null se nao aplicavel a campo). */
export function targetToFormPath(target: string): string | null {
  // Atributos: attrForca -> attributes.forca
  if (target.startsWith('attr')) {
    const key = target.slice(4).charAt(0).toLowerCase() + target.slice(5);
    return `attributes.${key}`;
  }
  // Skills: skillLuta -> expertise.luta
  if (target.startsWith('skill')) {
    const key = target.slice(5).charAt(0).toLowerCase() + target.slice(6);
    return `expertise.${key}`;
  }
  // Status especificos
  const statusMap: Record<string, string> = {
    defArmor: 'status.armorBonus',
    defOther: 'status.otherBonus',
    resPhysical: 'status.physicalRes',
    resMagical: 'status.magicalRes',
  };
  return statusMap[target] ?? null;
}

/** Inverso: dado um path de form, retorna o target opaque (pra render de UI). */
export function formPathToTarget(path: string): string | null {
  if (path.startsWith('attributes.')) {
    const key = path.slice('attributes.'.length);
    return `attr${key.charAt(0).toUpperCase()}${key.slice(1)}` as AttrTarget;
  }
  if (path.startsWith('expertise.')) {
    const key = path.slice('expertise.'.length);
    return `skill${key.charAt(0).toUpperCase()}${key.slice(1)}` as SkillTarget;
  }
  const reverseMap: Record<string, string> = {
    'status.armorBonus': 'defArmor',
    'status.otherBonus': 'defOther',
    'status.physicalRes': 'resPhysical',
    'status.magicalRes': 'resMagical',
  };
  return reverseMap[path] ?? null;
}

/** Labels portugueses pra exibicao em badges de buff ("+2 Forca") */
export const TARGET_LABELS: Record<string, string> = {
  attrForca: 'Forca',
  attrDestreza: 'Destreza',
  attrConstituicao: 'Constituicao',
  attrInteligencia: 'Inteligencia',
  attrSabedoria: 'Sabedoria',
  attrCarisma: 'Carisma',
  defArmor: 'Armadura',
  defOther: 'Defesa (Outros)',
  resPhysical: 'Res. Fisica',
  resMagical: 'Res. Magica',
  REDUCE_MANA: 'Custo de Mana',
  REDUCE_STAMINA: 'Custo de Estamina',
  RESTORE_HP: 'Recupera Vida',
  RESTORE_MANA: 'Recupera Mana',
  RESTORE_STAMINA: 'Recupera Estamina',
  skillAtletismo: 'Atletismo',
  skillConhecimento: 'Conhecimento',
  skillConsertar: 'Consertar',
  skillDiplomacia: 'Diplomacia',
  skillDomar: 'Domar',
  skillEmpatia: 'Empatia',
  skillFortitude: 'Fortitude',
  skillFurtividade: 'Furtividade',
  skillMagia: 'Magia',
  skillIniciativa: 'Iniciativa',
  skillIntimidar: 'Intimidacao',
  skillIntuicao: 'Intuicao',
  skillInvestigacao: 'Investigacao',
  skillLabia: 'Labia',
  skillLadinagem: 'Ladinagem',
  skillLuta: 'Luta',
  skillMedicina: 'Medicina',
  skillMente: 'Mente',
  skillPercepcao: 'Percepcao',
  skillPontaria: 'Pontaria',
  skillReflexos: 'Reflexos',
  skillSeduzir: 'Seduzir',
  skillSobrevivencia: 'Sobrevivencia',
};

// Helpers de tipo: campos validos de cada embeddable (pra autocomplete)
export type AttributeField = keyof Attributes;
export type ExpertiseField = keyof Expertise;
export type StatusField = keyof Status;
