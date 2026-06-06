/**
 * SweetAlert2 — tema e helpers compartilhados.
 *
 * Centraliza o SWAL_THEME (gótico-ritual) e o lazy-load do SweetAlert2 (sai ~100KB do
 * bundle inicial) que antes estavam duplicados em DashboardPage e SheetPage. `confirmDanger`
 * padroniza as confirmações destrutivas (botão vermelho-sangue) usadas por deletar ficha,
 * mesa, cena, etc.
 */

export const SWAL_THEME = {
  background: '#14121A',
  color: '#EDE6D6',
  confirmButtonColor: '#7B2CBF',
  cancelButtonColor: '#1A1820',
} as const;

/** Lazy-load do SweetAlert2 — economiza ~100KB no bundle inicial. */
export async function getSwal() {
  return (await import('sweetalert2')).default;
}

interface ConfirmDangerOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'question' | 'info' | 'error' | 'success';
}

/**
 * Confirmação destrutiva temática (botão de confirmar em vermelho-sangue).
 * Resolve `true` se o usuário confirmou, `false` caso contrário.
 */
export async function confirmDanger({
  title,
  text,
  confirmText = 'Sim, excluir',
  cancelText = 'Cancelar',
  icon = 'warning',
}: ConfirmDangerOptions): Promise<boolean> {
  const Swal = await getSwal();
  const result = await Swal.fire({
    ...SWAL_THEME,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#B91C1C',
  });
  return result.isConfirmed;
}
