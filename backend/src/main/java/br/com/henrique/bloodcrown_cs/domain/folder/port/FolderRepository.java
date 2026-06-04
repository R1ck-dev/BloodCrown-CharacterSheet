package br.com.henrique.bloodcrown_cs.domain.folder.port;

import java.util.List;
import java.util.Optional;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;

/**
 * Porta de saída do agregado Folder.
 * Adapter: FolderRepositoryAdapter (infrastructure/persistence/folder/adapter).
 */
public interface FolderRepository {
    Folder salvar(Folder folder);
    List<Folder> listarPorUsuario(String userId);
    Optional<Folder> buscarPorIdEUsuario(String id, String userId);
    void deletar(String id);
}
