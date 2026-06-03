/**
 * Efeitos sonoros do app — engine minúscula sobre HTMLAudioElement.
 *
 * Cada `playSound(name)` cria um Audio novo (permite sons sobrepostos) apontando
 * pra um arquivo em `public/sounds/`. O browser cacheia o arquivo após o 1º load.
 * Falha em silêncio se o arquivo ainda não existir ou se o autoplay for bloqueado,
 * então o app já funciona sem os assets — o som "liga" quando os .mp3 forem soltos.
 *
 * Preferências (mudo/volume) ficam em localStorage ('bc_sound'), espelhando o
 * padrão de [theme.ts]. Um pequeno store (subscribe/emit) alimenta o hook useSound.
 */

export type SoundName =
  | 'crit'
  | 'heavy'
  | 'dice'
  | 'levelup'
  | 'ability'
  | 'turn'
  | 'rest'
  | 'item';

const BASE = import.meta.env.BASE_URL;

/**
 * Evento → arquivo em `public/sounds/`. Solte os .mp3 com estes nomes pra ligar
 * o som (ver public/sounds/README.md).
 */
export const SOUND_MANIFEST: Record<SoundName, string> = {
  crit: `${BASE}sounds/crit.mp3`,
  heavy: `${BASE}sounds/heavy.mp3`,
  dice: `${BASE}sounds/dice.mp3`,
  levelup: `${BASE}sounds/levelup.mp3`,
  ability: `${BASE}sounds/ability.mp3`,
  turn: `${BASE}sounds/turn.mp3`,
  rest: `${BASE}sounds/rest.mp3`,
  item: `${BASE}sounds/item.mp3`,
};

export interface SoundPrefs {
  muted: boolean;
  /** 0..1 */
  volume: number;
}

const STORAGE_KEY = 'bc_sound';
const DEFAULT_PREFS: SoundPrefs = { muted: false, volume: 0.5 };

function clampVolume(v: number): number {
  if (Number.isNaN(v)) return DEFAULT_PREFS.volume;
  return Math.min(1, Math.max(0, v));
}

function loadPrefs(): SoundPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<SoundPrefs>;
    return {
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_PREFS.muted,
      volume: clampVolume(Number(parsed.volume ?? DEFAULT_PREFS.volume)),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

// Estado em módulo + listeners (fonte da verdade pro useSound via useSyncExternalStore).
let prefs: SoundPrefs = loadPrefs();
const listeners = new Set<() => void>();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* localStorage indisponível — vale até o reload */
  }
}

/** Retorna a referência atual das prefs (estável entre mudanças — ok pro getSnapshot). */
export function getSoundPrefs(): SoundPrefs {
  return prefs;
}

/** Atualiza prefs (merge), persiste e notifica os listeners. */
export function setSoundPrefs(patch: Partial<SoundPrefs>): void {
  prefs = {
    muted: patch.muted ?? prefs.muted,
    volume: patch.volume !== undefined ? clampVolume(patch.volume) : prefs.volume,
  };
  persist();
  listeners.forEach((l) => l());
}

/** Subscreve mudanças de prefs. Retorna a função de unsubscribe. */
export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Toca um efeito sonoro. Respeita mudo/volume. Não lança: se o arquivo não
 * existir ou o autoplay for bloqueado, ignora silenciosamente.
 */
export function playSound(name: SoundName): void {
  if (prefs.muted || prefs.volume <= 0) return;
  const src = SOUND_MANIFEST[name];
  if (!src) return;
  try {
    const audio = new Audio(src);
    audio.volume = prefs.volume;
    void audio.play().catch(() => {
      /* autoplay bloqueado ou arquivo ausente — ignora */
    });
  } catch {
    /* ambiente sem suporte a Audio — ignora */
  }
}
