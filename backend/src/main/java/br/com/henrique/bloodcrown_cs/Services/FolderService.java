package br.com.henrique.bloodcrown_cs.Services;

import java.util.List;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.FolderDTO;

/**
 * Operacoes de gestao de pastas (organizacao flat de fichas).
 * Todas as operacoes validam ownership via Authentication.
 */
public interface FolderService {
    /** Lista pastas do usuario autenticado, ordenadas por nome. */
    List<FolderDTO> listFolders(Authentication authentication);

    /** Cria nova pasta com o nome informado no DTO. */
    FolderDTO createFolder(FolderDTO dto, Authentication authentication);

    /** Renomeia uma pasta existente. */
    FolderDTO renameFolder(String folderId, FolderDTO dto, Authentication authentication);

    /** Deleta uma pasta. Fichas dentro sao movidas pra raiz (folderId = null). */
    void deleteFolder(String folderId, Authentication authentication);
}
