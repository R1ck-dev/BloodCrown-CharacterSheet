/**
 * Campo numérico que exibe `base + buff` por padrão (dourado + brilho quando buffado) e,
 * ao clicar, vira um input editável do `base`. Commit no blur/Enter, Escape cancela. Dá a
 * qualquer valor de ficha (perícia, armadura, outros, resistências) a mesma exibição de
 * "valor somado" dos atributos — o buff (efêmero, de habilidade/item ativo) aparece sem
 * sobrescrever a base persistida.
 */
import { useEffect, useState, type CSSProperties } from 'react';

interface BuffedValueFieldProps {
  base: number;
  buff: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  /** Estilo base aplicado ao input e ao botão de exibição (mantém a aparência do campo). */
  baseStyle: CSSProperties;
  /** Estilo extra do botão quando buffado (default: borda + brilho dourados). */
  buffedStyle?: CSSProperties;
  /** Estilo extra do wrapper (ex.: marginLeft auto). */
  style?: CSSProperties;
}

const DEFAULT_BUFFED_STYLE: CSSProperties = {
  borderColor: 'rgba(212, 175, 55, 0.55)',
  color: 'var(--bc-gold-bright)',
  textShadow: '0 0 10px color-mix(in srgb, var(--bc-gold-bright) 70%, transparent)',
};

export function BuffedValueField({
  base,
  buff,
  onCommit,
  ariaLabel,
  baseStyle,
  buffedStyle = DEFAULT_BUFFED_STYLE,
  style,
}: BuffedValueFieldProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number>(base);

  // Re-sincroniza com base quando muda por fora (server roundtrip / auto-save),
  // sem atropelar uma edição em andamento.
  useEffect(() => {
    if (!editing) setValue(base);
  }, [base, editing]);

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => {
          const raw = e.target.valueAsNumber;
          setValue(Number.isNaN(raw) ? 0 : raw);
        }}
        onBlur={() => {
          setEditing(false);
          onCommit(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          else if (e.key === 'Escape') {
            setValue(base);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        style={{ ...baseStyle, ...style }}
      />
    );
  }

  const isBuffed = buff !== 0;
  const displayed = value + buff;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={`${ariaLabel}: ${displayed}${isBuffed ? ` (base ${value}, buff ${buff >= 0 ? '+' : ''}${buff})` : ''}. Clique para editar.`}
      title={
        isBuffed
          ? `Base ${value} ${buff >= 0 ? '+' : '−'} ${Math.abs(buff)} de buff = ${displayed}`
          : 'Clique para editar'
      }
      style={{
        ...baseStyle,
        ...style,
        cursor: 'text',
        ...(isBuffed ? buffedStyle : null),
      }}
    >
      {displayed}
    </button>
  );
}
