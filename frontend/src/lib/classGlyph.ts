/**
 * Heuristica simples pra escolher um icone Lucide a partir do nome da classe
 * do personagem. Match por palavra-chave (case-insensitive, sem acento).
 * Fallback: Star (generico). Cor sugerida tambem retornada pro tema do card.
 */
import {
  Skull,
  Sword,
  Shield,
  Flame,
  Zap,
  Sparkles,
  Moon,
  Crown,
  Star,
  Heart,
  type LucideIcon,
} from 'lucide-react';

export interface GlyphInfo {
  Icon: LucideIcon;
  /** Cor da gota radial do avatar — usada como acento por classe */
  base: string;
  bright: string;
}

const RULES: Array<{ keywords: string[]; info: GlyphInfo }> = [
  {
    keywords: ['necromante', 'necro', 'morto', 'sombra', 'sombrio'],
    info: { Icon: Skull, base: '#5A189A', bright: '#9D4EDD' },
  },
  {
    keywords: ['cacador', 'arqueiro', 'atirador', 'patrulheiro'],
    info: { Icon: Zap, base: '#1D4ED8', bright: '#3B82F6' },
  },
  {
    keywords: ['inquisidor', 'paladin', 'guardia', 'defensor', 'cavaleir'],
    info: { Icon: Shield, base: '#8A0303', bright: '#B91C1C' },
  },
  {
    keywords: ['bruxo', 'sangue', 'piromante', 'piromaniaco'],
    info: { Icon: Flame, base: '#CA8A04', bright: '#D4AF37' },
  },
  {
    keywords: ['druida', 'natura', 'xama'],
    info: { Icon: Star, base: '#15803D', bright: '#22C55E' },
  },
  {
    keywords: ['mago', 'feiticeir', 'magico', 'arcanista', 'magia'],
    info: { Icon: Sparkles, base: '#5A189A', bright: '#9D4EDD' },
  },
  {
    keywords: ['lamina', 'espadachim', 'guerreiro', 'lutador', 'mestre da'],
    info: { Icon: Sword, base: '#7B2CBF', bright: '#9D4EDD' },
  },
  {
    keywords: ['sacerdot', 'clerigo', 'profeta', 'oraculo'],
    info: { Icon: Moon, base: '#5A189A', bright: '#7B2CBF' },
  },
  {
    keywords: ['rei', 'rainha', 'nobre', 'monarca'],
    info: { Icon: Crown, base: '#CA8A04', bright: '#D4AF37' },
  },
  {
    keywords: ['curador', 'medico', 'medicina'],
    info: { Icon: Heart, base: '#8A0303', bright: '#B91C1C' },
  },
];

const DEFAULT: GlyphInfo = { Icon: Star, base: '#7B2CBF', bright: '#9D4EDD' };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function glyphForClass(characterClass: string | null | undefined): GlyphInfo {
  if (!characterClass) return DEFAULT;
  const haystack = normalize(characterClass);
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return rule.info;
    }
  }
  return DEFAULT;
}
