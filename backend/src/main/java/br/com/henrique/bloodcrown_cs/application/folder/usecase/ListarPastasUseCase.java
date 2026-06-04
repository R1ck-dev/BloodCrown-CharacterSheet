package br.com.henrique.bloodcrown_cs.application.folder.usecase;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;

import lombok.RequiredArgsConstructor;

/**
 * Lista as pastas do usuário. Cache por userId (folders muda pouco e é lido a cada
 * abertura do dashboard); invalidado por criar/renomear/deletar.
 */
@Service
@RequiredArgsConstructor
public class ListarPastasUseCase {

    private final FolderRepository folderRepository;

    @Cacheable(value = "folders", key = "#userId")
    @Transactional(readOnly = true)
    public List<Folder> execute(String userId) {
        return folderRepository.listarPorUsuario(userId);
    }
}
