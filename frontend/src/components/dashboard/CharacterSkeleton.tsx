/**
 * Card fantasma renderizado durante o fetch de useCharacters.
 * Forma proxima do CharacterCard pra evitar reflow ao trocar.
 */

export function CharacterSkeleton() {
  return (
    <div
      className="bc-frame"
      aria-hidden="true"
      style={{
        borderRadius: 'var(--bc-radius-md)',
        padding: 20,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: 0.7,
      }}
    >
      {/* Avatar placeholder */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <div className="bc-skeleton" style={{ width: 76, height: 76, borderRadius: '50%' }} />
      </div>

      {/* Linhas texto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <div className="bc-skeleton" style={{ height: 16, width: '70%' }} />
        <div className="bc-skeleton" style={{ height: 11, width: '50%' }} />
      </div>

      {/* HP bar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="bc-skeleton" style={{ height: 9, width: 38 }} />
        <div className="bc-skeleton" style={{ height: 4, flex: 1 }} />
      </div>

      {/* Botao placeholder */}
      <div className="bc-skeleton" style={{ height: 36, marginTop: 4 }} />
    </div>
  );
}
