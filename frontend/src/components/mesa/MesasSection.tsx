/**
 * Seção "Mesas de Jogo" do dashboard: lista as mesas do usuário, cria nova e entra por código.
 * Auto-contida (hooks próprios) pra não acoplar à lógica de fichas do DashboardPage.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Crown, LogIn, Map, Plus, Trash2 } from 'lucide-react';
import { useCreateMesa, useDeleteMesa, useEntrarMesa, useMesas } from '@/api/mesas';

export function MesasSection() {
  const navigate = useNavigate();
  const { data: mesas, isLoading } = useMesas();
  const criar = useCreateMesa();
  const entrar = useEntrarMesa();
  const deletar = useDeleteMesa();
  const [codigo, setCodigo] = useState('');

  const handleCriar = async () => {
    const nome = window.prompt('Nome da nova mesa:', '');
    if (nome === null || !nome.trim()) return;
    try {
      const mesa = await criar.mutateAsync({ nome: nome.trim() });
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
    if (!window.confirm(`Excluir a mesa "${nome}"? Essa ação é permanente.`)) return;
    try {
      await deletar.mutateAsync(id);
      toast.success(`Mesa "${nome}" excluída.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir mesa.');
    }
  };

  return (
    <section style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Map size={20} color="var(--bc-gold)" aria-hidden="true" />
        <h2 className="bc-cinzel bc-tracked" style={{ fontSize: 20, color: 'var(--bc-ink)', margin: 0 }}>
          MESAS DE JOGO
        </h2>
        <div style={{ flex: 1 }} />
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="CÓDIGO"
          maxLength={12}
          className="bc-input"
          style={{ width: 130, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
        />
        <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={handleEntrar} disabled={entrar.isPending}>
          <LogIn size={16} /> Entrar
        </button>
        <button type="button" className="bc-btn bc-btn--primary bc-btn--sm" onClick={handleCriar} disabled={criar.isPending}>
          <Plus size={16} /> Nova mesa
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {isLoading && <p style={{ color: 'var(--bc-ink-dim)' }}>Carregando mesas...</p>}
        {!isLoading && mesas?.length === 0 && (
          <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic' }}>
            Nenhuma mesa ainda. Crie uma ou entre por código.
          </p>
        )}
        {mesas?.map((m) => (
          <article
            key={m.id}
            onClick={() => navigate(`/mesa/${m.id}`)}
            style={{
              cursor: 'pointer',
              padding: 16,
              borderRadius: 'var(--bc-radius-md)',
              border: '1px solid var(--bc-edge)',
              background: 'linear-gradient(180deg, #14121A, #0A0507)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {m.souDono && <Crown size={15} color="var(--bc-gold)" aria-label="Você é o mestre" />}
              <span className="bc-cinzel" style={{ fontSize: 15, color: 'var(--bc-ink)' }}>{m.nome}</span>
              <div style={{ flex: 1 }} />
              {m.souDono && (
                <button
                  type="button"
                  className="bc-btn bc-btn--ghost bc-btn--sm"
                  title="Excluir mesa"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletar(m.id, m.nome);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--bc-ink-faint)', letterSpacing: '0.1em' }}>
              código: {m.codigoConvite}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
