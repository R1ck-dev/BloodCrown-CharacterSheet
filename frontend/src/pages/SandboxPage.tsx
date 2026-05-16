/**
 * Showroom de componentes do design system. Dev-only — exposto em /sandbox
 * apenas quando import.meta.env.DEV. Organiza primitivos por categoria pra
 * validacao visual rapida durante a Fase 2 e pra iteracao posterior.
 *
 * Renderiza cada componente em variantes lado-a-lado. Estados especiais
 * (.is-disabled) sao forçados via classe pra inspecao sem mouse.
 */
import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Search, Crown, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { HeraldicFrame } from '@/components/ornaments/HeraldicFrame';
import { Logo } from '@/components/ornaments/Logo';
import { WaxSeal } from '@/components/ornaments/WaxSeal';
import { Divider } from '@/components/ornaments/Divider';
import { FiligreeCorner } from '@/components/ornaments/FiligreeCorner';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        className="bc-cinzel bc-tracked"
        style={{
          fontSize: 14,
          color: 'var(--bc-gold-bright)',
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: '1px solid var(--bc-edge)',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        {children}
      </div>
    </section>
  );
}

function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
      <span
        style={{
          fontSize: 10,
          color: 'var(--bc-ink-faint)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontFamily: 'var(--bc-font-mono)',
        }}
      >
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function SandboxPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <main
      className="bc-page bc-grain"
      style={{ padding: '48px 32px', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}
    >
      <header style={{ marginBottom: 40 }}>
        <Logo size="md" as="h1" />
        <p style={{ color: 'var(--bc-ink-dim)', marginTop: 8, fontStyle: 'italic' }}>
          Sandbox — showroom de componentes do design system (Fase 2). Visivel em dev.
        </p>
      </header>

      {/* ====== TYPOGRAPHY ====== */}
      <Section title="Tipografia">
        <Specimen label="Cinzel Display">
          <div className="bc-cinzel" style={{ fontSize: 32, color: 'var(--bc-ink)' }}>
            Per Astra Ad Cruor
          </div>
        </Specimen>
        <Specimen label="Cinzel Tracked">
          <div className="bc-cinzel bc-tracked" style={{ fontSize: 14, color: 'var(--bc-gold)' }}>
            Atributos Heroicos
          </div>
        </Specimen>
        <Specimen label="Inter Body">
          <p style={{ fontSize: 15, color: 'var(--bc-ink)' }}>
            A Coroa Sangrenta espreita nas sombras dos altares antigos.
          </p>
        </Specimen>
        <Specimen label="JetBrains Mono">
          <code className="bc-mono" style={{ fontSize: 13, color: 'var(--bc-gold-bright)' }}>
            roll(1d20 + 7) = 24
          </code>
        </Specimen>
        <Specimen label="Shimmer (CROWN)">
          <span className="bc-shimmer bc-cinzel" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.22em' }}>
            CROWN
          </span>
        </Specimen>
      </Section>

      {/* ====== ORNAMENTS ====== */}
      <Section title="Ornamentos">
        <Specimen label="Logo sm/md/lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
          </div>
        </Specimen>

        <Specimen label="FiligreeCorner">
          <div style={{ background: 'var(--bc-surface-2)', padding: 16 }}>
            <FiligreeCorner size={32} color="var(--bc-gold)" />
          </div>
        </Specimen>

        <Specimen label="WaxSeal — blood/gold/purple">
          <div style={{ display: 'flex', gap: 12 }}>
            <WaxSeal variant="blood" />
            <WaxSeal variant="gold" glyph="★" />
            <WaxSeal variant="purple" glyph="♛" />
          </div>
        </Specimen>

        <Specimen label="WaxSeal sm/md/lg">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <WaxSeal size="sm" />
            <WaxSeal size="md" />
            <WaxSeal size="lg" />
          </div>
        </Specimen>

        <div style={{ width: '100%' }}>
          <Specimen label="Divider — default / solid / blood">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 600 }}>
              <Divider glyph="✦" />
              <Divider glyph="◆ Iniciacao ◆" variant="solid" />
              <Divider glyph="✶" variant="blood" />
            </div>
          </Specimen>
        </div>
      </Section>

      {/* ====== FRAMES ====== */}
      <Section title="HeraldicFrame">
        <Specimen label="default + padded md">
          <HeraldicFrame padding="md" style={{ width: 280, minHeight: 140 }}>
            <p className="bc-cinzel" style={{ color: 'var(--bc-ink)' }}>
              Moldura default
            </p>
            <p style={{ color: 'var(--bc-ink-dim)', fontSize: 13, marginTop: 8 }}>
              Cantos filigrana + hairline interior dourado.
            </p>
          </HeraldicFrame>
        </Specimen>

        <Specimen label="glass + padded sm">
          <HeraldicFrame variant="glass" padding="sm" style={{ width: 280, minHeight: 140 }}>
            <p className="bc-cinzel" style={{ color: 'var(--bc-ink)' }}>
              Variante Glass
            </p>
            <p style={{ color: 'var(--bc-ink-dim)', fontSize: 13, marginTop: 8 }}>
              Backdrop blur 12px — sobrepoe page.
            </p>
          </HeraldicFrame>
        </Specimen>

        <Specimen label="solid (sem blur)">
          <HeraldicFrame variant="solid" padding="md" style={{ width: 280, minHeight: 140 }}>
            <p className="bc-cinzel" style={{ color: 'var(--bc-ink)' }}>
              Variante Solid
            </p>
            <p style={{ color: 'var(--bc-ink-dim)', fontSize: 13, marginTop: 8 }}>
              Pra modais — sem transparencia.
            </p>
          </HeraldicFrame>
        </Specimen>
      </Section>

      {/* ====== BUTTONS ====== */}
      <Section title="Buttons">
        <Specimen label="Primary md/sm/lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <Button size="lg">
              <Crown size={16} /> Coroar
            </Button>
            <Button>Salvar Ficha</Button>
            <Button size="sm">Confirmar</Button>
          </div>
        </Specimen>

        <Specimen label="Ghost / Danger">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="ghost">
              <Save size={14} /> Bloco de Notas
            </Button>
            <Button variant="danger">Excluir Ficha</Button>
          </div>
        </Specimen>

        <Specimen label="Loading / Disabled">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <Button loading>Salvando</Button>
            <Button disabled>Indisponivel</Button>
            <Button variant="ghost" disabled>Ghost off</Button>
          </div>
        </Specimen>

        <Specimen label="Block">
          <div style={{ width: 240 }}>
            <Button block>
              <Crown size={14} /> Entrar
            </Button>
          </div>
        </Specimen>
      </Section>

      {/* ====== FIELDS ====== */}
      <Section title="Fields / Inputs">
        <Specimen label="Field com label + icone">
          <div style={{ width: 280 }}>
            <Field label="Usuario" iconLeft={<User size={16} />} placeholder="thaumiel.veyra" />
          </div>
        </Specimen>

        <Specimen label="Senha + toggle reveal">
          <div style={{ width: 280 }}>
            <Field
              label="Senha"
              type={showPwd ? 'text' : 'password'}
              iconLeft={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  className="bc-input-icon bc-input-icon--right bc-input-icon--clickable"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              placeholder="••••••••"
            />
          </div>
        </Specimen>

        <Specimen label="Field com erro">
          <div style={{ width: 280 }}>
            <Field
              label="Email"
              iconLeft={<User size={16} />}
              defaultValue="invalido"
              error="Formato de email invalido."
            />
          </div>
        </Specimen>

        <Specimen label="Field com hint">
          <div style={{ width: 280 }}>
            <Field
              label="Codigo de invocacao"
              hint="Opcional — pra grupos privados."
              placeholder="XYZ-123"
            />
          </div>
        </Specimen>

        <Specimen label="Input sm + busca">
          <div style={{ width: 280 }}>
            <Input
              size="sm"
              iconLeft={<Search size={14} />}
              placeholder="Buscar pericia..."
            />
          </div>
        </Specimen>

        <Specimen label="Input bare (ficha)">
          <div style={{ width: 280 }}>
            <Input variant="bare" defaultValue="Morrigan Vex" />
          </div>
        </Specimen>
      </Section>

      {/* ====== SWITCH ====== */}
      <Section title="Switch (toggle heroico)">
        <Specimen label="Off / On (controlado)">
          <label className="bc-switch-wrap">
            <input
              className="bc-switch-wrap__input"
              type="checkbox"
              checked={switchOn}
              onChange={(e) => setSwitchOn(e.target.checked)}
            />
            <span className="bc-switch" aria-hidden="true" />
            <span className="bc-switch-wrap__label">Heroico</span>
          </label>
        </Specimen>

        <Specimen label="Disabled (forcado)">
          <label className="bc-switch-wrap is-disabled">
            <input className="bc-switch-wrap__input" type="checkbox" disabled />
            <span className="bc-switch" aria-hidden="true" />
            <span className="bc-switch-wrap__label">Inativo</span>
          </label>
        </Specimen>
      </Section>

      {/* ====== STATUS BARS ====== */}
      <Section title="Status Bars">
        <div style={{ width: '100%', maxWidth: 480 }}>
          {[
            { label: 'Vida', cur: 48, max: 62, vars: { '--bc-bar-bright': '#EF4444', '--bc-bar-base': '#B91C1C', '--bc-bar-dark': '#4A0303', '--bc-bar-glow': 'rgba(220,38,38,0.6)', '--bc-bar-text': '#FCA5A5' } },
            { label: 'Vida (critica)', cur: 8, max: 62, critical: true, vars: { '--bc-bar-bright': '#EF4444', '--bc-bar-base': '#B91C1C', '--bc-bar-dark': '#4A0303', '--bc-bar-glow': 'rgba(220,38,38,0.6)', '--bc-bar-text': '#FCA5A5' } },
            { label: 'Sanidade', cur: 31, max: 40, vars: { '--bc-bar-bright': '#3B82F6', '--bc-bar-base': '#1D4ED8', '--bc-bar-dark': '#0F1A4A', '--bc-bar-glow': 'rgba(59,130,246,0.5)', '--bc-bar-text': '#93C5FD' } },
            { label: 'Mana', cur: 22, max: 28, vars: { '--bc-bar-bright': '#22C55E', '--bc-bar-base': '#15803D', '--bc-bar-dark': '#0A3D1F', '--bc-bar-glow': 'rgba(34,197,94,0.5)', '--bc-bar-text': '#86EFAC' } },
            { label: 'Estamina', cur: 9, max: 18, vars: { '--bc-bar-bright': '#EAB308', '--bc-bar-base': '#CA8A04', '--bc-bar-dark': '#4A3503', '--bc-bar-glow': 'rgba(234,179,8,0.5)', '--bc-bar-text': '#FDE68A' } },
          ].map((b) => {
            const pct = Math.max(0, Math.min(100, (b.cur / b.max) * 100));
            return (
              <div className="bc-bar-row" key={b.label} style={{ marginBottom: 14, ...(b.vars as React.CSSProperties) }}>
                <div className="bc-bar-row__head">
                  <span className="bc-bar-row__label">{b.label}</span>
                  <span className="bc-bar-row__value">
                    {b.cur}
                    <span className="bc-bar-row__value-divider"> / {b.max}</span>
                  </span>
                </div>
                <div className={`bc-bar ${b.critical ? 'bc-bar--critical' : ''}`}>
                  <div className="bc-bar__fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ====== MEDALLIONS (Atributos) ====== */}
      <Section title="Medallions (Atributos)">
        <Specimen label="Padrao + Buffed">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {(['FOR', 'DES', 'INT'] as const).map((label, i) => (
              <div className="bc-medallion-wrap" key={label}>
                <span className="bc-medallion__label">{label}</span>
                <button
                  type="button"
                  className={`bc-medallion ${i === 1 ? 'bc-medallion--buffed' : ''}`}
                  aria-label={`Atributo ${label}`}
                >
                  <span className="bc-medallion__num">{12 + i * 3}</span>
                </button>
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen label="Tamanho sm">
          <div className="bc-medallion-wrap">
            <span className="bc-medallion__label">CAR</span>
            <button type="button" className="bc-medallion bc-medallion--sm" aria-label="Atributo CAR">
              <span className="bc-medallion__num">10</span>
            </button>
          </div>
        </Specimen>
      </Section>

      {/* ====== TABS ====== */}
      <Section title="Tabs">
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div className="bc-tabs">
            {['COMBATE', 'MAGIA', 'INVENTARIO', 'DESCRICAO'].map((t, i) => (
              <button
                key={t}
                type="button"
                className={`bc-tab ${i === 0 ? 'bc-tab--active' : ''}`}
                aria-selected={i === 0}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="bc-tab-panel" style={{ background: 'var(--bc-surface-1)', minHeight: 80, marginTop: 2 }}>
            <p style={{ color: 'var(--bc-ink-dim)', fontStyle: 'italic' }}>
              Conteudo da tab ativa.
            </p>
          </div>
        </div>
      </Section>

      <Divider glyph="✶ FIM DO SANDBOX ✶" variant="solid" />
    </main>
  );
}
