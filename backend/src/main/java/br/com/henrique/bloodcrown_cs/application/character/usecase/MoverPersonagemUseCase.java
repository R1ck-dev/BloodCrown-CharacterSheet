package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Move a ficha entre pastas. Valida posse do personagem e, quando há destino,
 * posse da pasta (folderId null/vazio = raiz).
 */
@Service
@RequiredArgsConstructor
public class MoverPersonagemUseCase {

    private final CharacterRepository characterRepository;
    private final FolderRepository folderRepository;

    @Transactional
    public void execute(String characterId, String userId, String folderId) {
        Character character = characterRepository.buscarPorIdEUsuario(characterId, userId)
                .orElseThrow(() -> new NotFoundException("Personagem nao encontrado."));

        if (folderId != null && !folderId.isBlank()) {
            folderRepository.buscarPorIdEUsuario(folderId, userId)
                    .orElseThrow(() -> new NotFoundException("Pasta nao encontrada."));
        }

        character.moveToFolder(folderId);
        characterRepository.salvar(character);
    }
}
