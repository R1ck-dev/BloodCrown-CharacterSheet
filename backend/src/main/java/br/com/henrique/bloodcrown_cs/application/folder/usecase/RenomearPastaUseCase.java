package br.com.henrique.bloodcrown_cs.application.folder.usecase;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RenomearPastaUseCase {

    private final FolderRepository folderRepository;

    @CacheEvict(value = "folders", key = "#userId")
    @Transactional
    public Folder execute(String folderId, String userId, String name) {
        Folder folder = folderRepository.buscarPorIdEUsuario(folderId, userId)
                .orElseThrow(() -> new NotFoundException("Pasta nao encontrada."));
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Nome da pasta nao pode ser vazio.");
        }
        folder.renomear(trimmed);
        return folderRepository.salvar(folder);
    }
}
