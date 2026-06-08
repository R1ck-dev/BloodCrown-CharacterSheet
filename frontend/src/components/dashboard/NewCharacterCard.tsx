/**
 * Card "+ Forje uma nova lenda" — borda tracejada dourada, hover ilumina.
 * Espelha o `.new-card` do protótipo: círculo tracejado com "+" (ou RefreshCw
 * girando em "Forjando…"), título em Cinzel e subtítulo italico dim.
 * Acionado por click; desabilita enquanto a ficha é forjada.
 */
import { Plus, RefreshCw } from 'lucide-react';

interface Props {
  onClick: () => void;
  loading?: boolean;
}

export function NewCharacterCard({ onClick, loading = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Criar novo personagem"
      className="bc-new-card"
    >
      <span aria-hidden="true" className="bc-new-card__circle">
        {loading ? (
          <RefreshCw size={22} strokeWidth={1.6} className="bc-spin" />
        ) : (
          <Plus size={24} strokeWidth={1.4} />
        )}
      </span>
      <span>
        <span className="bc-cinzel bc-tracked bc-new-card__title">
          {loading ? 'Forjando…' : 'Novo Personagem'}
        </span>
        <span className="bc-new-card__subtitle">Forje uma nova lenda</span>
      </span>
    </button>
  );
}
