/**
 * Logica pura de rolagem de dados — sem DOM, sem React.
 *
 * Sistema BloodCrown: teste de atributo = rola N d20 (N = valor do atributo,
 * minimo 1), pega o maior, soma bonus de pericia se houver. Critico em 20 nat.
 *
 * Dano: parse de string tipo "2d8+3", "1d6 + 1d4 - 2", etc.
 */

export interface AttributeRoll {
  kind: 'attribute';
  source: string;
  rolls: number[];
  best: number;
  bonus: number;
  total: number;
  isCriticalSuccess: boolean; // nat 20
}

export interface DamageRoll {
  kind: 'damage';
  source: string;
  rolls: number[];
  modifier: number;
  total: number;
  isHeavyHit: boolean; // total >= 20 — pra trigger de shake/flash
  maxFace: number;
}

export type RollResult = AttributeRoll | DamageRoll;

function rollDie(faces: number): number {
  // Math.ceil(random * faces) gera 1..faces. random nunca retorna 1.0 entao
  // o ceil sempre cai entre 1 e faces inclusive.
  return Math.ceil(Math.random() * faces);
}

/**
 * Teste de atributo (pode incluir pericia).
 *
 * @param source Nome amigavel ("Teste de Forca", "Atletismo (FOR)")
 * @param attrValue Valor do atributo base + buff — define quantos d20 rolar
 * @param skillBonus Bonus adicional de pericia. 0 se for so atributo.
 */
export function rollAttribute(source: string, attrValue: number, skillBonus = 0): AttributeRoll {
  const diceCount = Math.max(1, attrValue);
  const rolls: number[] = [];
  for (let i = 0; i < diceCount; i++) {
    rolls.push(rollDie(20));
  }
  const best = Math.max(...rolls);
  const total = best + skillBonus;
  return {
    kind: 'attribute',
    source,
    rolls,
    best,
    bonus: skillBonus,
    total,
    isCriticalSuccess: best === 20,
  };
}

/**
 * Rolagem de formula de dano: "2d8+3", "1d6 + 2d4 + 1", "1d12 - 1".
 * Retorna null se a formula for vazia ou totalmente invalida.
 */
export function rollDamage(formula: string, source: string): DamageRoll | null {
  const cleaned = formula.toLowerCase().replace(/\s+/g, '');
  if (!cleaned.match(/\d/)) return null;

  // Token: [+-]?NdM ou [+-]?N (modificador puro)
  const tokenRe = /([+-]?)(\d+)d(\d+)|([+-]?)(\d+)/g;
  const allRolls: number[] = [];
  let total = 0;
  let modifier = 0;
  let maxFace = 0;

  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(cleaned)) !== null) {
    if (match[2] && match[3]) {
      // Dado
      const sign = match[1] === '-' ? -1 : 1;
      const count = parseInt(match[2]);
      const faces = parseInt(match[3]);
      if (faces > maxFace) maxFace = faces;
      for (let i = 0; i < count; i++) {
        const r = rollDie(faces);
        allRolls.push(sign === -1 ? -r : r);
        total += r * sign;
      }
    } else if (match[5]) {
      // Modificador
      const sign = match[4] === '-' ? -1 : 1;
      const val = parseInt(match[5]) * sign;
      modifier += val;
      total += val;
    }
  }

  if (allRolls.length === 0 && modifier === 0) return null;

  return {
    kind: 'damage',
    source,
    rolls: allRolls,
    modifier,
    total,
    isHeavyHit: total >= 20,
    maxFace: maxFace || 20,
  };
}
