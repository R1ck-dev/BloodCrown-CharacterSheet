/**
 * Navbar do Dashboard — Logo + saudacao + theme picker + botao Sair.
 * Sticky no topo, hairline dourada inferior.
 */
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ornaments/Logo';
import { Button } from '@/components/ui/Button';
import { ThemePicker } from '@/components/ui/ThemePicker';

interface Props {
  onLogout: () => void;
}

export function Navbar({ onLogout }: Props) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        height: 64,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--bc-oled) 95%, transparent) 0%, color-mix(in srgb, var(--bc-oled) 85%, transparent) 100%)',
        borderBottom: '1px solid var(--bc-edge)',
        backdropFilter: 'blur(12px)',
        zIndex: 'var(--bc-z-sticky)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 2,
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--bc-gold) 40%, transparent), transparent)',
        }}
      />

      <Logo size="sm" />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingLeft: 24,
          borderLeft: '1px solid color-mix(in srgb, var(--bc-gold) 12%, transparent)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--bc-ink-dim)', fontStyle: 'italic' }}>
          Bem-vindo,
        </span>
        <span
          className="bc-cinzel bc-tracked-soft"
          style={{ fontSize: 12, color: 'var(--bc-gold-bright)', fontWeight: 600 }}
        >
          Aventureiro
        </span>
      </div>

      <ThemePicker />

      <Button variant="danger" size="sm" onClick={onLogout}>
        <LogOut size={12} />
        Sair
      </Button>
    </nav>
  );
}
