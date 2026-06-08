/**
 * Card fantasma renderizado durante o fetch de useCharacters.
 * Forma próxima do CharacterCard (avatar, nome, classe, barra, botão) pra
 * evitar reflow ao trocar. Usa o shimmer base .bc-skeleton em blocos .bc-skel-block.
 */

export function CharacterSkeleton() {
  return (
    <div
      className="bc-frame"
      aria-hidden="true"
      style={{
        borderRadius: 'var(--bc-radius-lg)',
        padding: '18px 16px',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {/* Avatar */}
      <span className="bc-skeleton bc-skel-block" style={{ width: 68, height: 68, borderRadius: '50%' }} />

      {/* Nome + classe */}
      <span className="bc-skeleton bc-skel-block" style={{ width: '70%', height: 14 }} />
      <span className="bc-skeleton bc-skel-block" style={{ width: '45%', height: 10 }} />

      {/* Barra de vida */}
      <span className="bc-skeleton bc-skel-block" style={{ width: '100%', height: 8, marginTop: 6 }} />

      {/* Botão "Abrir Ficha" */}
      <span className="bc-skeleton bc-skel-block" style={{ width: '100%', height: 36, marginTop: 'auto' }} />
    </div>
  );
}
