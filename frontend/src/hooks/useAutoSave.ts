/**
 * Auto-save de formulario controlado por RHF.
 *
 * - Watcha o formulario inteiro e dispara `onSave` apos `delay`ms de inatividade.
 * - Salva em qualquer mudanca de CAMPO do usuario (emit do watch com `info.name`); ignora os emits
 *   sem nome (carga inicial e reset() pos-save), que sao programaticos e nao devem disparar save.
 * - Estado expostos: 'idle' | 'saving' | 'saved' | 'error'.
 * - Retorna trigger manual `saveNow()` que ignora debounce.
 *
 * Uso:
 *   const form = useForm<CharacterSheet>({ defaultValues });
 *   const { status, saveNow } = useAutoSave({
 *     watch: form.watch,
 *     getValues: form.getValues,
 *     onSave: async (data) => updateMutation.mutateAsync(data),
 *   });
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormGetValues, UseFormWatch } from 'react-hook-form';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Options<T extends FieldValues> {
  watch: UseFormWatch<T>;
  getValues: UseFormGetValues<T>;
  onSave: (data: T) => Promise<unknown>;
  /** Debounce em ms apos ultima mudanca. Default 1000. */
  delay?: number;
  /** Tempo (ms) que o status 'saved' permanece antes de voltar pra 'idle'. Default 2000. */
  savedHoldMs?: number;
}

export function useAutoSave<T extends FieldValues>({
  watch,
  getValues,
  onSave,
  delay = 1000,
  savedHoldMs = 2000,
}: Options<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);

  // Mantem a ultima ref pra evitar reanexar effect quando handler muda
  onSaveRef.current = onSave;

  const performSave = useCallback(async () => {
    try {
      setStatus('saving');
      await onSaveRef.current(getValues());
      setStatus('saved');
      if (holdRef.current) clearTimeout(holdRef.current);
      holdRef.current = setTimeout(() => setStatus('idle'), savedHoldMs);
    } catch (e) {
      console.error('[useAutoSave]', e);
      setStatus('error');
    }
  }, [getValues, savedHoldMs]);

  // Watch dispara em toda mudança; salva (debounced) em qualquer alteração de CAMPO do usuário.
  //
  // Guardar por `info.name` (presente nas mudanças de campo, ausente nos emits de reset()/programáticos)
  // em vez de `isDirty` corrige um bug sutil: o callback do watch roda SÍNCRONO na mudança, ANTES do
  // re-render que atualiza `formState.isDirty`. Como o reset() pós-save zera o dirty, a PRIMEIRA
  // alteração seguinte via o `isDirty` obsoleto=false e era descartada — daí a ficha (e a barra do
  // tabuleiro) só atualizar "às vezes" / só ao mexer várias vezes (setinhas). Sem `isDirty` nas deps,
  // o effect assina uma vez e o timer de debounce sobrevive aos re-renders. O patch real continua
  // saindo só com os dirtyFields (handleSave ignora patch vazio), então salvar em qualquer named
  // change é seguro e idempotente.
  useEffect(() => {
    const subscription = watch((_values, info) => {
      if (!info?.name) return; // ignora carga inicial / emits de reset() (sem campo)
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSave();
      }, delay);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, delay, performSave]);

  // Cleanup do hold ao desmontar
  useEffect(() => {
    return () => {
      if (holdRef.current) clearTimeout(holdRef.current);
    };
  }, []);

  const saveNow = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    return performSave();
  }, [performSave]);

  return { status, saveNow };
}
