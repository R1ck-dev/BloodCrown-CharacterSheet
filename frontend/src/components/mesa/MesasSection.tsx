/**
 * Seção "Mesas de Jogo" do dashboard: lista as mesas do usuário, cria nova (modal
 * temático) e entra por código. Auto-contida (hooks próprios) pra não acoplar à
 * lógica de fichas do DashboardPage.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, Map, Plus } from 'lucide-react';
import { useCreateMesa, useDeleteMesa, useEntrarMesa, useMesas } from '@/api/mesas';
import { PromptModal } from '@/components/ui/PromptModal';
import { Divider } from '@/components/ornaments/Divider';
import { confirmDanger } from '@/lib/swal';
import { MesaCard } from './MesaCard';

export function MesasSection() {
  const navigate = useNavigate();
  const { data: mesas, isLoading, isError, error, refetch } = useMesas();
  const criar = useCreateMesa();
  const entrar = useEntrarMesa();
  const deletar = useDeleteMesa();
  const [codigo, setCodigo] = useState('');
  const [novaAberta, setNovaAberta] = useState(false);

  const handleCriar = async (nome: string) => {
    try {
      const mesa = await criar.mutateAsync({ nome });
      navigate(`/mesa/${mesa.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar mesa.');
    }
  };

  const handleEntrar = async () => {
    if (!codigo.trim()) return;
    try {
      const mesa = await entrar.mutateAsync({ codigo: codigo.trim() });
      navigate(`/mesa/${mesa.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Código inválido.');
    }
  };

  const handleDeletar = async (id: string, nome: string) => {
    const ok = await confirmDanger({
      title: `Excluir a mesa "${nome}"?`,
      text: 'Essa ação é permanente e não pode ser desfeita.',
      confirmText: 'Sim, excluir',
    });
    if (!ok) return;
    try {
      await deletar.mutateAsync(id);
      toast.success(`Mesa "${nome}" excluída.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir mesa.');
    }
  };

  const vazia = !isLoading && !isError && (mesas?.length ?? 0) === 0;

  return (
    <section aria-label="Mesas">
      <header className="bc-dashboard-header">
        <div
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--bc-radius-md)',
            background: 'linear-gradient(180deg, #1A1820, #0A0507)',
            border: '1px solid var(--bc-edge-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bc-gold)',
            boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.18), 0 4px 12px rgba(0,0,0,0.6)',
          }}
        >
          <Map size={26} />
        </div>

        <div>
          <h1
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 28, fontWeight: 600, color: 'var(--bc-ink)', margin: 0, lineHeight: 1.1 }}
          >
            SUAS MESAS
          </h1>
          <p style={{ fontSize: 13, color: 'var(--bc-ink-dim)', fontStyle: 'italic', marginTop: 4 }}>
            Mestre uma mesa em tempo real ou entre na de outro mestre por código.
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <div className="bc-mesa-join">
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            aria-label="Código de convite da mesa"
            maxLength={12}
            className="bc-input"
            style={{ width: 130, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
          />
          <button
            type="button"
            className="bc-btn bc-btn--ghost bc-btn--sm"
            onClick={handleEntrar}
            disabled={entrar.isPending || !codigo.trim()}
          >
            <LogIn size={16} /> Entrar
          </button>
          <button
            type="button"
            className="bc-btn bc-btn--primary bc-btn--sm"
            onClick={() => setNovaAberta(true)}
            disabled={criar.isPending}
          >
            <Plus size={16} /> Nova mesa
          </button>
        </div>
      </header>

      <div style={{ margin: '20px 0 28px' }}>
        <Divider glyph="✦ ✦ ✦" />
      </div>

      <div className="bc-mesa-grid">
        {isLoading && (
          <p style={{ gridColumn: '1 / -1', color: 'var(--bc-ink-dim)', fontStyle: 'italic' }}>
            Invocando mesas...
          </p>
        )}

        {isError && (
          <div
            role="alert"
            style={{
              gridColumn: '1 / -1',
              padding: 24,
              border: '1px solid rgba(185, 28, 28, 0.4)',
              background: 'rgba(138, 3, 3, 0.1)',
              borderRadius: 'var(--bc-radius-md)',
              color: '#FCA5A5',
            }}
          >
            <strong>Erro ao carregar mesas:</strong>{' '}
            {error instanceof Error ? error.message : 'Tente novamente.'}
            <button
              type="button"
              onClick={() => refetch()}
              className="bc-btn bc-btn--ghost bc-btn--sm"
              style={{ marginLeft: 16 }}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {vazia && (
          <div className="bc-mesa-empty">
            <Map size={40} className="bc-mesa-empty__icon" aria-hidden="true" />
            <span className="bc-mesa-empty__title bc-cinzel bc-tracked">NENHUMA MESA AINDA</span>
            <span className="bc-mesa-empty__text">
              Crie uma mesa pra reunir seu grupo no tabuleiro em tempo real, ou entre na mesa de
              outro mestre usando o código de convite.
            </span>
            <button type="button" className="bc-btn bc-btn--primary bc-btn--sm" onClick={() => setNovaAberta(true)}>
              <Plus size={16} /> Criar primeira mesa
            </button>
          </div>
        )}

        {mesas?.map((m) => (
          <MesaCard
            key={m.id}
            mesa={m}
            onOpen={() => navigate(`/mesa/${m.id}`)}
            onDelete={() => handleDeletar(m.id, m.nome)}
          />
        ))}
      </div>

      <PromptModal
        isOpen={novaAberta}
        title="Nova mesa"
        label="Nome da mesa"
        placeholder="Ex.: A Mansão Sangrenta"
        confirmText="Criar mesa"
        onConfirm={handleCriar}
        onClose={() => setNovaAberta(false)}
      />
    </section>
  );
}
