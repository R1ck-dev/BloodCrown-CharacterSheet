/**
 * Sheet — Ficha de Personagem (todas as fases integradas).
 *
 * Estrutura:
 *   - Header (sticky): nome/classe/nivel/heroico + acoes + save indicator
 *   - 3 colunas: Atributos+Status+Defesa | Pericias | Tabs+Cards
 *   - DiceToast (Fase 7): renderiza rolagens com animacao + crit confetti
 *   - EffectsPanel (Fase 7): flutuante lateral com habilidades ativas + Passar Turno
 *
 * SweetAlert2 carregado lazy pra reduzir bundle inicial (~100KB sai pra chunk).
 */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import type { CharacterSheet } from '@/types/character';
import { useCharacter, useUpdateCharacter, useRestCharacter } from '@/api/characters';
import { useAdvanceTurn } from '@/api/abilities';
import { useActiveEffects } from '@/hooks/useActiveEffects';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDiceRoll } from '@/hooks/useDiceRoll';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { AttributesBlock } from '@/components/sheet/AttributesBlock';
import { StatusBlock } from '@/components/sheet/StatusBlock';
import { DefenseBlock, computeDefense } from '@/components/sheet/DefenseBlock';
import { LeftDock } from '@/components/sheet/LeftDock';
import { Modal } from '@/components/sheet/modals/Modal';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { Button } from '@/components/ui/Button';
import { SkillsBlock } from '@/components/sheet/SkillsBlock';
import { RightColumn } from '@/components/sheet/RightColumn';
import { DiceToast } from '@/components/sheet/DiceToast';
import { EffectsPanel } from '@/components/sheet/EffectsPanel';

const SWAL_THEME = {
  background: '#14121A',
  color: '#EDE6D6',
  confirmButtonColor: '#7B2CBF',
  cancelButtonColor: '#1A1820',
};

/** Lazy-load do SweetAlert2 — economiza ~100KB no bundle inicial */
async function getSwal() {
  return (await import('sweetalert2')).default;
}

/** Burst dourado central — disparado em level up */
function fireLevelUpConfetti() {
  const goldColors = ['#D4AF37', '#F1D77A', '#FFFFFF', '#E6C34A'];
  const purpleColors = ['#7B2CBF', '#9D4EDD', '#C8A4FF', '#FFFFFF'];
  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    colors: goldColors,
    origin: { x: 0.5, y: 0.4 },
    scalar: 1.4,
    zIndex: 10000,
  });
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      angle: 60,
      colors: purpleColors,
      origin: { x: 0, y: 0.5 },
      zIndex: 10000,
    });
    confetti({
      particleCount: 50,
      spread: 60,
      angle: 120,
      colors: purpleColors,
      origin: { x: 1, y: 0.5 },
      zIndex: 10000,
    });
  }, 220);
}

export function SheetPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useCharacter(id);
  const updateMutation = useUpdateCharacter();
  const restMutation = useRestCharacter(id ?? '');
  const advanceTurnMutation = useAdvanceTurn(id ?? '');
  const { buffs, activeAbilities } = useActiveEffects(data);
  const { rollAttr, rollDmg } = useDiceRoll();

  const form = useForm<CharacterSheet>({
    // Inicializa vazio — reset() preenche quando data chegar
    defaultValues: undefined,
  });
  const { reset, watch, getValues, formState } = form;
  const initialized = useRef(false);
  const previousLevelRef = useRef<number>(0);

  // Preenche o form na primeira vez que data chega.
  // Updates posteriores (ex: turno avancado) podem revalidar, mas o form
  // mantem o estado do usuario — fluxos dedicados (toggle de habilidade)
  // entram na Fase 6 via mutations especificas.
  useEffect(() => {
    if (data && !initialized.current) {
      reset(data);
      initialized.current = true;
      previousLevelRef.current = data.level ?? 0;
    }
  }, [data, reset]);

  // Level up detector — watcha o campo level, dispara confetti dourado central
  // sempre que sobe (manualmente ou via heroico). Snapshot inicial vem do reset().
  useEffect(() => {
    const subscription = watch((value, info) => {
      if (info.name !== 'level') return;
      const current = Number(value.level) || 0;
      const previous = previousLevelRef.current;
      if (current > previous && previous > 0) {
        fireLevelUpConfetti();
        toast.success(`Nivel ${current}!`, { duration: 3000 });
      }
      previousLevelRef.current = current;
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Notepad temporario (localStorage por personagem, nao vai pro backend)
  const [notepad, setNotepad] = useState('');
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [notepadDraft, setNotepadDraft] = useState('');
  useEffect(() => {
    if (id) {
      setNotepad(localStorage.getItem(`bc_notepad_${id}`) || '');
    }
  }, [id]);
  const saveNotepad = (value: string) => {
    setNotepad(value);
    if (id) localStorage.setItem(`bc_notepad_${id}`, value);
  };

  const handleSave = async (formData: CharacterSheet) => {
    if (!data) return;
    // Merge: lists vem do cache (mutations dedicadas controlam),
    // defense computada antes de persistir.
    const merged: CharacterSheet = {
      ...formData,
      attacks: data.attacks,
      abilities: data.abilities,
      inventory: data.inventory,
      status: {
        ...formData.status,
        defense: computeDefense(formData.attributes, formData.status, buffs),
      },
    };
    await updateMutation.mutateAsync(merged);
  };

  const { status: saveStatus, saveNow } = useAutoSave({
    watch,
    getValues,
    isDirty: formState.isDirty,
    onSave: handleSave,
  });

  const handleSaveClick = async () => {
    try {
      await saveNow();
      toast.success('Ficha salva.');
    } catch {
      toast.error('Erro ao salvar.');
    }
  };

  const handleRest = async () => {
    const Swal = await getSwal();
    const result = await Swal.fire({
      ...SWAL_THEME,
      title: 'Descanso longo?',
      text: 'Isso recupera toda Vida, Mana, Sanidade, Estamina e reseta usos de habilidades.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, descansar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await restMutation.mutateAsync();
      toast.success('Renovado. Voce esta pronto para a aventura.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro no descanso.';
      toast.error(message);
    }
  };

  const handleOpenNotepad = () => {
    setNotepadDraft(notepad);
    setNotepadOpen(true);
  };

  const handleSaveNotepad = () => {
    saveNotepad(notepadDraft);
    setNotepadOpen(false);
    toast.success('Notas salvas localmente.');
  };

  const handleAdvanceTurn = async () => {
    try {
      await advanceTurnMutation.mutateAsync();
      toast('Turno avancado.', { icon: '⏳' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao avancar turno.');
    }
  };

  if (!id) {
    return <main style={{ padding: 48 }}>ID de personagem nao especificado.</main>;
  }

  if (isLoading || !data || !initialized.current) {
    return (
      <main className="bc-page bc-grain" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--bc-ink-dim)' }}>Carregando ficha...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="bc-page bc-grain" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#FCA5A5' }}>
          Erro: {error instanceof Error ? error.message : 'Falha ao carregar.'}
        </p>
      </main>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="bc-page bc-grain" style={{ minHeight: '100vh' }}>
        <SheetHeader
          saveStatus={saveStatus}
          onSaveNow={handleSaveClick}
          onOpenNotepad={handleOpenNotepad}
          onRest={handleRest}
          isSaving={saveStatus === 'saving' || updateMutation.isPending}
          isResting={restMutation.isPending}
        />

        <div
          style={{
            padding: 20,
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 3fr) minmax(0, 5fr) minmax(0, 4fr)',
            gap: 20,
            minHeight: 'calc(100vh - 68px)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ESQUERDA — ActionPool e DamageCalc moveram pro LeftDock flutuante */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <AttributesBlock buffs={buffs} onRoll={rollAttr} />
            <StatusBlock />
            <DefenseBlock buffs={buffs} />
          </div>

          {/* CENTRAL — pericias */}
          <SkillsBlock buffs={buffs} onRoll={rollAttr} />

          {/* DIREITA — tabs + cards + modais */}
          <RightColumn
            characterId={id}
            attacks={data.attacks ?? []}
            abilities={data.abilities ?? []}
            inventory={data.inventory ?? []}
            onRollDamage={rollDmg}
          />
        </div>

        {/* Toast de dado (anima crit + confetti) */}
        <DiceToast />

        {/* Dock flutuante esquerda — botões pra Ações do Turno e Calculadora de Dano */}
        <LeftDock characterId={id} />

        {/* Painel flutuante de efeitos ativos (some quando vazio) */}
        <EffectsPanel
          activeAbilities={activeAbilities}
          onAdvanceTurn={handleAdvanceTurn}
          isAdvancing={advanceTurnMutation.isPending}
        />

        {/* Notepad — localStorage por personagem, Markdown split editor */}
        <Modal
          isOpen={notepadOpen}
          onClose={() => setNotepadOpen(false)}
          title="Bloco de Notas"
          maxWidth={760}
          footer={
            <>
              <Button variant="ghost" onClick={() => setNotepadOpen(false)}>Fechar</Button>
              <Button onClick={handleSaveNotepad}>Salvar</Button>
            </>
          }
        >
          <p
            style={{
              color: 'var(--bc-ink-faint)',
              fontSize: 12,
              fontStyle: 'italic',
              margin: '0 0 12px',
            }}
          >
            Estas notas ficam salvas no seu navegador e nao vao pro banco de dados.
          </p>
          <MarkdownEditor
            value={notepadDraft}
            onChange={setNotepadDraft}
            placeholder="# Sessao 1&#10;&#10;- Personagem X disse...&#10;- Encontramos uma porta tranca"
            rows={14}
            mode="split"
            minHeight={360}
          />
        </Modal>
      </div>
    </FormProvider>
  );
}
