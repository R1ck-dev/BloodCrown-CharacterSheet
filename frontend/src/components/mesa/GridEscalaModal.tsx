/**
 * GridEscalaModal — configura o grid e a escala de medição da cena num único modal
 * temático (substitui os 3 window.prompt sequenciais antigos). Campos: tamanho da
 * célula (px), quanto vale 1 célula em unidades de jogo, a unidade, a cor do grid e
 * se o grid está visível. Submete tudo de uma vez via configurarGrid.
 */
import { useEffect, useState } from 'react';
import { Modal } from '@/components/sheet/modals/Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Cena, ConfigurarGridInput } from '@/types/mesa';

interface Props {
  isOpen: boolean;
  cena: Cena | null;
  onClose: () => void;
  onSubmit: (payload: ConfigurarGridInput) => void;
}

export function GridEscalaModal({ isOpen, cena, onClose, onSubmit }: Props) {
  const [tamanhoCelula, setTamanhoCelula] = useState('50');
  const [escalaValor, setEscalaValor] = useState('1.5');
  const [escalaUnidade, setEscalaUnidade] = useState('m');
  const [cor, setCor] = useState('#D4AF37');
  const [visivel, setVisivel] = useState(true);

  // Semeia os campos com os valores atuais da cena toda vez que abre.
  useEffect(() => {
    if (isOpen && cena) {
      setTamanhoCelula(String(cena.grid.tamanhoCelula));
      setEscalaValor(String(cena.escalaValor));
      setEscalaUnidade(cena.escalaUnidade ?? 'm');
      setCor(cena.grid.cor || '#D4AF37');
      setVisivel(cena.grid.visivel);
    }
  }, [isOpen, cena]);

  const submit = () => {
    if (!cena) return;
    onSubmit({
      tamanhoCelula: Math.max(1, Math.round(Number(tamanhoCelula) || cena.grid.tamanhoCelula)),
      visivel,
      cor: cor || cena.grid.cor,
      escalaValor: Math.max(0.01, Number(escalaValor) || cena.escalaValor),
      escalaUnidade: escalaUnidade.trim() || 'm',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grid e escala"
      maxWidth={460}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>Salvar</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field
          label="Tamanho da célula (px)"
          type="number"
          inputMode="numeric"
          min={1}
          value={tamanhoCelula}
          onChange={(e) => setTamanhoCelula(e.target.value)}
          hint="Lado de cada quadrado do grid, em pixels do mapa."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field
            label="1 célula equivale a"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0.01}
            value={escalaValor}
            onChange={(e) => setEscalaValor(e.target.value)}
          />
          <Field
            label="Unidade"
            placeholder="m, ft, quadras"
            value={escalaUnidade}
            onChange={(e) => setEscalaUnidade(e.target.value)}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <label className="bc-field__label" htmlFor="grid-cor" style={{ margin: 0 }}>
            Cor do grid
          </label>
          <input
            id="grid-cor"
            type="color"
            className="bc-color-input"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
        </div>

        <label className="bc-switch-wrap">
          <input
            type="checkbox"
            className="bc-switch-wrap__input"
            checked={visivel}
            onChange={() => setVisivel((v) => !v)}
          />
          <span className="bc-switch" aria-hidden="true" />
          <span className="bc-switch-wrap__label">Grid visível</span>
        </label>
      </div>
    </Modal>
  );
}
