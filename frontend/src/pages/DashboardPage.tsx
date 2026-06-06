/**
 * Dashboard — duas áreas separadas por um seletor de modo (medalhão):
 *   - Personagens: pastas + grid de fichas (criar/abrir/deletar/mover).
 *   - Mesas: mesas tabletop em tempo real (criar/entrar/abrir/deletar).
 * A aba ativa vive na URL (?aba=mesas) pra deep-link e refresh (replace, sem poluir histórico).
 * SweetAlert2 nas confirmações pesadas (logout, delete), Sonner pros toasts.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Castle, Map, ScrollText, Swords } from 'lucide-react';
import { Navbar } from '@/components/dashboard/Navbar';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { NewCharacterCard } from '@/components/dashboard/NewCharacterCard';
import { CharacterSkeleton } from '@/components/dashboard/CharacterSkeleton';
import { FolderDrawer } from '@/components/dashboard/FolderDrawer';
import { SegmentedTabs } from '@/components/dashboard/SegmentedTabs';
import type { FolderSelection } from '@/components/dashboard/FolderSidebar';
import { MesasSection } from '@/components/mesa/MesasSection';
import { Divider } from '@/components/ornaments/Divider';
import { useCharacters, useCreateCharacter, useDeleteCharacter } from '@/api/characters';
import { useMesas } from '@/api/mesas';
import {
  useFolders,
  useCreateFolder,
  useRenameFolder,
  useDeleteFolder,
  useMoveCharacter,
} from '@/api/folders';
import { tokenStorage } from '@/api/client';
import { SWAL_THEME, getSwal, confirmDanger } from '@/lib/swal';
import type { Folder } from '@/types/character';

type Aba = 'personagens' | 'mesas';

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useCharacters();
  const { data: folders } = useFolders();
  const { data: mesas } = useMesas();
  const createMutation = useCreateCharacter();
  const deleteMutation = useDeleteCharacter();
  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const deleteFolderMutation = useDeleteFolder();
  const moveCharacterMutation = useMoveCharacter();
  const username = tokenStorage.getUsername();

  const aba: Aba = searchParams.get('aba') === 'mesas' ? 'mesas' : 'personagens';
  const setAba = (next: Aba) => {
    const p = new URLSearchParams(searchParams);
    if (next === 'personagens') p.delete('aba');
    else p.set('aba', next);
    setSearchParams(p, { replace: true });
  };

  // undefined = "Todas" (default), null = "Sem pasta", string = ID
  const [selectedFolder, setSelectedFolder] = useState<FolderSelection>(undefined);

  const folderList: Folder[] = folders ?? [];
  const visibleChars = useMemo(() => {
    if (!data) return [];
    if (selectedFolder === undefined) return data;
    if (selectedFolder === null) return data.filter((c) => !c.folderId);
    return data.filter((c) => c.folderId === selectedFolder);
  }, [data, selectedFolder]);

  const folderNameById = (id: string) => folderList.find((f) => f.id === id)?.name ?? null;

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

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolderMutation.mutateAsync({ name });
      toast.success(`Pasta "${name}" criada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar pasta.');
    }
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    try {
      await renameFolderMutation.mutateAsync({ folderId, payload: { name } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao renomear pasta.');
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    const ok = await confirmDanger({
      title: `Deletar pasta "${folder.name}"?`,
      text: 'As fichas dentro voltam pra raiz (nada e perdido).',
      confirmText: 'Sim, deletar',
    });
    if (!ok) return;
    try {
      await deleteFolderMutation.mutateAsync(folder.id);
      if (selectedFolder === folder.id) setSelectedFolder(undefined);
      toast.success(`Pasta "${folder.name}" deletada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao deletar pasta.');
    }
  };

  const handleMoveCharacter = async (characterId: string, folderId: string | null) => {
    try {
      await moveCharacterMutation.mutateAsync({ characterId, folderId });
      const label = folderId ? (folderNameById(folderId) ?? 'pasta') : 'Sem pasta';
      toast.success(`Movido pra "${label}".`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao mover ficha.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirmDanger({
      title: `Excluir "${name}"?`,
      text: 'Essa acao e permanente e nao pode ser desfeita.',
      confirmText: 'Sim, excluir',
    });
    if (!ok) return;
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
      <Navbar onLogout={handleLogout} username={username} />

      <main className="bc-dashboard-main">
        {/* Seletor de modo (medalhão) — separa Personagens de Mesas */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <SegmentedTabs
            aria-label="Alternar entre personagens e mesas"
            value={aba}
            onChange={setAba}
            options={[
              { value: 'personagens', label: 'Personagens', icon: <Swords size={15} />, count: data?.length },
              { value: 'mesas', label: 'Mesas', icon: <Map size={15} />, count: mesas?.length },
            ]}
          />
        </div>

        {aba === 'personagens' ? (
          <section aria-label="Personagens">
            {/* Section header */}
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
                <Castle size={26} />
              </div>

              <div>
                <h1
                  className="bc-cinzel bc-tracked"
                  style={{ fontSize: 28, fontWeight: 600, color: 'var(--bc-ink)', margin: 0, lineHeight: 1.1 }}
                >
                  SEUS PERSONAGENS
                </h1>
                <p style={{ fontSize: 13, color: 'var(--bc-ink-dim)', fontStyle: 'italic', marginTop: 4 }}>
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
                  <span className="bc-cinzel bc-tracked-soft" style={{ fontSize: 11, color: 'var(--bc-gold-bright)' }}>
                    {visibleChars.length} {visibleChars.length === 1 ? 'ficha' : 'fichas'}
                    {selectedFolder !== undefined && data.length !== visibleChars.length && (
                      <span style={{ color: 'var(--bc-ink-faint)', marginLeft: 6 }}>de {data.length}</span>
                    )}
                  </span>
                </div>
              )}
            </header>

            <div style={{ margin: '20px 0 28px' }}>
              <Divider glyph="✦ ✦ ✦" />
            </div>

            {/* Layout 2 colunas: sidebar de pastas + grid de fichas */}
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
              <div className="bc-dashboard-layout">
                <FolderDrawer
                  folders={folderList}
                  characters={data ?? []}
                  selected={selectedFolder}
                  onSelect={setSelectedFolder}
                  onCreate={handleCreateFolder}
                  onRename={handleRenameFolder}
                  onDelete={handleDeleteFolder}
                  busy={createFolderMutation.isPending || deleteFolderMutation.isPending || renameFolderMutation.isPending}
                />

                <div className="bc-dashboard-grid">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <CharacterSkeleton key={i} />)
                    : visibleChars.map((c) => (
                        <CharacterCard
                          key={c.id}
                          character={c}
                          folders={folderList}
                          onOpen={() => navigate(`/sheet/${c.id}`)}
                          onDelete={() => handleDelete(c.id, c.name)}
                          onMove={(folderId) => handleMoveCharacter(c.id, folderId)}
                        />
                      ))}
                  {!isLoading && <NewCharacterCard onClick={handleCreate} loading={createMutation.isPending} />}
                </div>
              </div>
            )}
          </section>
        ) : (
          <MesasSection />
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
            style={{ flex: 1, height: 1, maxWidth: 200, background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3))' }}
          />
          <span className="bc-cinzel bc-tracked" style={{ fontSize: 9, color: 'rgba(212, 175, 55, 0.5)' }}>
            ✶ &nbsp; PER · ASTRA · AD · CRUOR &nbsp; ✶
          </span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, maxWidth: 200, background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.3), transparent)' }}
          />
        </footer>
      </main>
    </div>
  );
}
