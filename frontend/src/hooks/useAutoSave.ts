/**
 * Auto-save de formulario controlado por RHF.
 *
 * - Watcha o formulario inteiro e dispara `onSave` apos `delay`ms de inatividade.
 * - Pula o primeiro emit (initial render do RHF, dirty=false).
 * - Pula tambem quando isDirty for false (carga inicial via reset()).
 * - Estado expostos: 'idle' | 'saving' | 'saved' | 'error'.
 * - Retorna trigger manual `saveNow()` que ignora debounce.
 *
 * Uso:
 *   const form = useForm<CharacterSheet>({ defaultValues });
 *   const { status, saveNow } = useAutoSave({
 *     watch: form.watch,
 *     isDirty: form.formState.isDirty,
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
  isDirty: boolean;
  onSave: (data: T) => Promise<unknown>;
  /** Debounce em ms apos ultima mudanca. Default 1000. */
  delay?: number;
  /** Tempo (ms) que o status 'saved' permanece antes de voltar pra 'idle'. Default 2000. */
  savedHoldMs?: number;
}

export function useAutoSave<T extends FieldValues>({
  watch,
  getValues,
  isDirty,
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

  // Watch dispara em toda mudanca; debounce + check de isDirty
  useEffect(() => {
    const subscription = watch(() => {
      if (!isDirty) return; // ignora carga inicial via reset()
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSave();
      }, delay);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, isDirty, delay, performSave]);

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
