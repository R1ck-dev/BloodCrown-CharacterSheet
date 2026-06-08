/**
 * Sidebar de pastas do Dashboard.
 *
 * Mostra: "Todas" / "Sem pasta" / lista de pastas com count + botoes Renomear/Deletar.
 * Inline input pra criar nova pasta (toggle por botao "+ Nova pasta").
 *
 * Selecao controlada via prop `selectedFolderId`:
 *   - undefined (default) = "Todas"
 *   - null = "Sem pasta" (raiz)
 *   - string = ID de pasta especifica
 */
import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Folder as FolderIcon, FolderPlus, Inbox, Layers, Pencil, Trash2 } from 'lucide-react';
import type { Folder, CharacterSummary } from '@/types/character';

export type FolderSelection = undefined | null | string;

interface Props {
  folders: Folder[];
  characters: CharacterSummary[];
  selected: FolderSelection;
  onSelect: (sel: FolderSelection) => void;
  onCreate: (name: string) => Promise<void> | void;
  onRename: (folderId: string, name: string) => Promise<void> | void;
  onDelete: (folder: Folder) => Promise<void> | void;
  busy?: boolean;
}

export function FolderSidebar({
  folders,
  characters,
  selected,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  busy = false,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) newInputRef.current?.focus();
  }, [creating]);
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const countAll = characters.length;
  const countRoot = characters.filter((c) => !c.folderId).length;
  const countByFolder = (folderId: string) =>
    characters.filter((c) => c.folderId === folderId).length;

  const submitCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setCreating(false);
      setNewName('');
      return;
    }
    await onCreate(name);
    setCreating(false);
    setNewName('');
  };

  const submitRename = async (folderId: string) => {
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    await onRename(folderId, name);
    setRenamingId(null);
  };

  return (
    <aside className="bc-folder-sidebar">
      <div className="bc-folder-sidebar__header">
        <Layers size={12} aria-hidden="true" />
        <span className="bc-cinzel bc-tracked">PASTAS</span>
      </div>

      {/* "Todas" */}
      <FolderRow
        icon={<Layers size={14} />}
        label="Todas"
        count={countAll}
        active={selected === undefined}
        onClick={() => onSelect(undefined)}
      />
      {/* "Sem pasta" (raiz) */}
      <FolderRow
        icon={<Inbox size={14} />}
        label="Sem pasta"
        count={countRoot}
        active={selected === null}
        onClick={() => onSelect(null)}
      />

      <div className="bc-folder-sidebar__divider" aria-hidden="true" />

      {/* Pastas customizadas */}
      {folders.length === 0 && !creating && (
        <p className="bc-folder-sidebar__empty">
          Nenhuma pasta criada.
        </p>
      )}
      {folders.map((f) =>
        renamingId === f.id ? (
          <div key={f.id} className="bc-folder-sidebar__row bc-folder-sidebar__row--editing">
            <FolderIcon size={14} aria-hidden="true" />
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => submitRename(f.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename(f.id);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              className="bc-folder-sidebar__input"
              maxLength={60}
              aria-label="Novo nome da pasta"
            />
          </div>
        ) : (
          <FolderRow
            key={f.id}
            icon={selected === f.id ? <FolderOpen size={14} /> : <FolderIcon size={14} />}
            label={f.name}
            count={countByFolder(f.id)}
            active={selected === f.id}
            onClick={() => onSelect(f.id)}
            onRename={() => {
              setRenameValue(f.name);
              setRenamingId(f.id);
            }}
            onDelete={() => onDelete(f)}
            disabled={busy}
          />
        ),
      )}

      {/* Nova pasta — inline */}
      {creating ? (
        <div className="bc-folder-sidebar__row bc-folder-sidebar__row--editing">
          <FolderPlus size={14} aria-hidden="true" />
          <input
            ref={newInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={submitCreate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCreate();
              if (e.key === 'Escape') {
                setCreating(false);
                setNewName('');
              }
            }}
            placeholder="Nome da pasta..."
            className="bc-folder-sidebar__input"
            maxLength={60}
            aria-label="Nome da nova pasta"
          />
        </div>
      ) : (
        <button
          type="button"
          className="bc-folder-sidebar__new"
          onClick={() => setCreating(true)}
          disabled={busy}
        >
          <FolderPlus size={13} />
          Nova pasta
        </button>
      )}
    </aside>
  );
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

function FolderRow({ icon, label, count, active, onClick, onRename, onDelete, disabled }: RowProps) {
  return (
    <div className={`bc-folder-sidebar__row ${active ? 'bc-folder-sidebar__row--active' : ''}`}>
      <button
        type="button"
        className="bc-folder-sidebar__main"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        aria-label={`Pasta ${label}`}
      >
        <span className="bc-folder-sidebar__icon">{icon}</span>
        <span className="bc-folder-sidebar__label">{label}</span>
        <span className="bc-folder-sidebar__count">{count}</span>
      </button>
      {(onRename || onDelete) && (
        <div className="bc-folder-sidebar__actions">
          {onRename && (
            <button
              type="button"
              className="bc-folder-sidebar__action-btn"
              onClick={onRename}
              aria-label={`Renomear pasta ${label}`}
              title="Renomear"
              disabled={disabled}
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="bc-folder-sidebar__action-btn bc-folder-sidebar__action-btn--danger"
              onClick={onDelete}
              aria-label={`Deletar pasta ${label}`}
              title="Deletar"
              disabled={disabled}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
