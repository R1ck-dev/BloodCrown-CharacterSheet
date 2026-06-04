package br.com.henrique.bloodcrown_cs.application.folder.usecase;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Deleta uma pasta movendo suas fichas para a raiz (folder = null) — escolha do usuário
 * pra evitar perda acidental de dados.
 */
@Service
@RequiredArgsConstructor
public class DeletarPastaUseCase {

    private final FolderRepository folderRepository;
    private final CharacterRepository characterRepository;

    @CacheEvict(value = "folders", key = "#userId")
    @Transactional
    public void execute(String folderId, String userId) {
        Folder folder = folderRepository.buscarPorIdEUsuario(folderId, userId)
                .orElseThrow(() -> new NotFoundException("Pasta nao encontrada."));

        List<Character> fichas = characterRepository.buscarPorPastaEUsuario(folderId, userId);
        for (Character ficha : fichas) {
            ficha.moveToFolder(null);
            characterRepository.salvar(ficha);
        }

        folderRepository.deletar(folder.getId());
    }
}
