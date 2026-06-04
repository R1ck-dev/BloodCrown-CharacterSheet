package br.com.henrique.bloodcrown_cs.application.folder.usecase;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CriarPastaUseCase {

    private final FolderRepository folderRepository;

    @CacheEvict(value = "folders", key = "#userId")
    @Transactional
    public Folder execute(String userId, String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Nome da pasta nao pode ser vazio.");
        }
        Folder folder = Folder.criar(trimmed, userId);
        return folderRepository.salvar(folder);
    }
}
