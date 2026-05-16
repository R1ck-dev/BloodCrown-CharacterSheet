/**
 * Bloco STATUS — 4 barras vitais empilhadas.
 * Vida tem criticalAware=true (pulsa quando <25%).
 */
import { StatusBar } from './StatusBar';

export function StatusBlock() {
  return (
    <section
      style={{
        padding: '18px 18px 8px',
        marginTop: 14,
        background: 'var(--bc-gradient-surface)',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
          paddingBottom: 8,
          borderBottom: '1px solid var(--bc-edge)',
        }}
      >
        <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">
          ✦
        </span>
        <h2
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, margin: 0, flex: 1 }}
        >
          STATUS
        </h2>
        <span
          aria-hidden="true"
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)',
          }}
        />
      </header>

      <StatusBar label="Vida"     color="red"    currentField="currentHealth"  maxField="maxHealth"  criticalAware />
      <StatusBar label="Sanidade" color="blue"   currentField="currentSanity"  maxField="maxSanity" />
      <StatusBar label="Mana"     color="green"  currentField="currentMana"    maxField="maxMana" />
      <StatusBar label="Estamina" color="yellow" currentField="currentStamina" maxField="maxStamina" />
    </section>
  );
}
