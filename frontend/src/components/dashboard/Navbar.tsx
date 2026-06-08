/**
 * Navbar do Dashboard — Logo + saudacao + theme picker + botao Sair.
 * Sticky no topo, hairline dourada inferior. Estilos em styles/components/nav.css.
 *
 * Em mobile <480px: esconde "Bem-vindo," e oculta texto "Sair" (mantem icone +
 * aria-label). Padding/gap escalam via clamp().
 */
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ornaments/Logo';
import { Button } from '@/components/ui/Button';
import { ThemePicker } from '@/components/ui/ThemePicker';

interface Props {
  onLogout: () => void;
  /** Nome do usuario logado pra saudacao. Se vazio, omite a saudacao. */
  username?: string | null;
}

export function Navbar({ onLogout, username }: Props) {
  return (
    <nav className="bc-nav">
      <Logo size="sm" />

      <span className="bc-nav__sep" aria-hidden="true" />

      {username && (
        <span className="bc-nav__welcome">
          <span className="bc-nav__greeting">Bem-vindo,</span>
          <span className="bc-nav__username bc-cinzel">{username}</span>
        </span>
      )}

      <span className="bc-nav__spacer" />

      <ThemePicker />

      <Button variant="danger" size="sm" onClick={onLogout} aria-label="Sair">
        <LogOut size={12} />
        <span className="bc-nav__logout-text">Sair</span>
      </Button>
    </nav>
  );
}
