/**
 * SegmentedTabs — seletor de modo estilo medalhão (trilho de pedra + opção ativa
 * em relevo dourado/roxo). Usado no Dashboard pra alternar Personagens | Mesas.
 *
 * Acessível: role="tablist" + role="tab", aria-selected, roving tabindex e
 * navegação por setas (←/→/Home/End). Estilos em styles/components/segmented.css.
 */
import { useRef, type ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Contagem opcional exibida como badge à direita do label. */
  count?: number;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  'aria-label'?: string;
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number, fromIndex: number) => {
    const next = (fromIndex + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(1, index);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1, index);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(options[0].value);
      refs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = options.length - 1;
      onChange(options[last].value);
      refs.current[last]?.focus();
    }
  };

  return (
    <div className="bc-segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={`bc-segmented__option${active ? ' bc-segmented__option--active' : ''}`}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.icon && (
              <span className="bc-segmented__icon" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            {opt.label}
            {opt.count !== undefined && <span className="bc-segmented__count">{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
