/**
 * Dashboard — Mesa de Jogo.
 * Lista as fichas do usuario, permite criar/abrir/deletar.
 * SweetAlert2 nas confirmacoes pesadas (logout, delete), Sonner pros toasts.
 */
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Castle, ScrollText } from 'lucide-react';
import { Navbar } from '@/components/dashboard/Navbar';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { NewCharacterCard } from '@/components/dashboard/NewCharacterCard';
import { CharacterSkeleton } from '@/components/dashboard/CharacterSkeleton';
import { Divider } from '@/components/ornaments/Divider';
import { useCharacters, useCreateCharacter, useDeleteCharacter } from '@/api/characters';
import { tokenStorage } from '@/api/client';

const SWAL_THEME = {
  background: '#14121A',
  color: '#EDE6D6',
  confirmButtonColor: '#7B2CBF',
  cancelButtonColor: '#1A1820',
};

/** Lazy-load do SweetAlert2 — economiza ~100KB no bundle inicial */
async function getSwal() {
  return (await import('sweetalert2')).default;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useCharacters();
  const createMutation = useCreateCharacter();
  const deleteMutation = useDeleteCharacter();
  const username = tokenStorage.getUsername();

  const handleLogout = async () => {
    const Swal = await getSwal();
    const result = await Swal.fire({
      ...SWAL_THEME,
      title: 'Sair?',
      text: 'Voce sera desconectado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sair',
      cancelButtonText: 'Ficar',
    });
    if (result.isConfirmed) {
      tokenStorage.clear();
      navigate('/', { replace: true });
    }
  };

  const handleCreate = async () => {
    try {
      const newChar = await createMutation.mutateAsync();
      navigate(`/sheet/${newChar.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao criar ficha.';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const Swal = await getSwal();
    const result = await Swal.fire({
      ...SWAL_THEME,
      title: `Excluir "${name}"?`,
      text: 'Essa acao e permanente e nao pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#B91C1C',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Ficha "${name}" excluida.`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao deletar.';
      toast.error(message);
    }
  };

  return (
    <div className="bc-page bc-grain" style={{ minHeight: '100vh' }}>
      <Navbar onLogout={handleLogout} />

      <main style={{ padding: '36px 48px 24px', position: 'relative', zIndex: 2 }}>
        {/* Section header */}
        <header
          style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8, flexWrap: 'wrap' }}
        >
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
            <Castle size={26} />
          </div>

          <div>
            <h1
              className="bc-cinzel bc-tracked"
              style={{ fontSize: 28, fontWeight: 600, color: 'var(--bc-ink)', margin: 0, lineHeight: 1.1 }}
            >
              SEUS PERSONAGENS
            </h1>
            <p
              style={{
                fontSize: 13,
                color: 'var(--bc-ink-dim)',
                fontStyle: 'italic',
                marginTop: 4,
              }}
            >
              {username && (
                <>
                  Bem-vindo,{' '}
                  <strong style={{ color: 'var(--bc-gold-bright)', fontStyle: 'normal' }}>
                    {username}
                  </strong>
                  .{' '}
                </>
              )}
              Selecione uma ficha para jogar ou editar.
            </p>
          </div>

          <div style={{ flex: 1 }} />

          {/* Sigil de contagem */}
          {data && (
            <div
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--bc-radius-md)',
                border: '1px solid var(--bc-edge)',
                background: 'rgba(10, 5, 7, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <ScrollText size={14} color="var(--bc-gold)" aria-hidden="true" />
              <span
                className="bc-cinzel bc-tracked-soft"
                style={{ fontSize: 11, color: 'var(--bc-gold-bright)' }}
              >
                {data.length} {data.length === 1 ? 'ficha' : 'fichas'}
              </span>
            </div>
          )}
        </header>

        <div style={{ margin: '20px 0 28px' }}>
          <Divider glyph="✦ ✦ ✦" />
        </div>

        {/* Grid de cards */}
        {isError ? (
          <div
            role="alert"
            style={{
              padding: 24,
              border: '1px solid rgba(185, 28, 28, 0.4)',
              background: 'rgba(138, 3, 3, 0.1)',
              borderRadius: 'var(--bc-radius-md)',
              color: '#FCA5A5',
            }}
          >
            <strong>Erro ao carregar fichas:</strong>{' '}
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
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <CharacterSkeleton key={i} />)
              : data?.map((c) => (
                  <CharacterCard
                    key={c.id}
                    character={c}
                    onOpen={() => navigate(`/sheet/${c.id}`)}
                    onDelete={() => handleDelete(c.id, c.name)}
                  />
                ))}
            {!isLoading && (
              <NewCharacterCard onClick={handleCreate} loading={createMutation.isPending} />
            )}
          </div>
        )}

        {/* Footer ornamento */}
        <footer
          style={{
            marginTop: 48,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: 'rgba(212, 175, 55, 0.3)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              height: 1,
              maxWidth: 200,
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3))',
            }}
          />
          <span
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 9, color: 'rgba(212, 175, 55, 0.5)' }}
          >
            ✶ &nbsp; PER · ASTRA · AD · CRUOR &nbsp; ✶
          </span>
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              height: 1,
              maxWidth: 200,
              background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.3), transparent)',
            }}
          />
        </footer>
      </main>
    </div>
  );
}
