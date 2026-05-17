package br.com.henrique.bloodcrown_cs.Services.Impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.DTOs.FolderDTO;
import br.com.henrique.bloodcrown_cs.Exceptions.NotFoundException;
import br.com.henrique.bloodcrown_cs.Models.CharacterModel;
import br.com.henrique.bloodcrown_cs.Models.FolderModel;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.CharacterRepository;
import br.com.henrique.bloodcrown_cs.Repositories.FolderRepository;
import br.com.henrique.bloodcrown_cs.Services.FolderService;

@Service
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final CharacterRepository characterRepository;

    public FolderServiceImpl(FolderRepository folderRepository, CharacterRepository characterRepository) {
        this.folderRepository = folderRepository;
        this.characterRepository = characterRepository;
    }

    @Override
    public List<FolderDTO> listFolders(Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();
        return folderRepository.findByFromUserIdOrderByNameAsc(user.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public FolderDTO createFolder(FolderDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();
        String name = dto.name() == null ? "" : dto.name().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Nome da pasta nao pode ser vazio.");
        }
        FolderModel folder = new FolderModel();
        folder.setName(name);
        folder.setFromUser(user);
        return toDTO(folderRepository.save(folder));
    }

    @Override
    public FolderDTO renameFolder(String folderId, FolderDTO dto, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();
        FolderModel folder = folderRepository.findByIdAndFromUserId(folderId, user.getId())
                .orElseThrow(() -> new NotFoundException("Pasta nao encontrada."));
        String name = dto.name() == null ? "" : dto.name().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Nome da pasta nao pode ser vazio.");
        }
        folder.setName(name);
        return toDTO(folderRepository.save(folder));
    }

    /**
     * Deleta pasta. Move fichas pra raiz (folder = null) — escolha do usuario
     * pra evitar perda acidental de dados.
     */
    @Override
    @Transactional
    public void deleteFolder(String folderId, Authentication authentication) {
        UserModel user = (UserModel) authentication.getPrincipal();
        FolderModel folder = folderRepository.findByIdAndFromUserId(folderId, user.getId())
                .orElseThrow(() -> new NotFoundException("Pasta nao encontrada."));

        List<CharacterModel> chars = characterRepository.findByFolderIdAndFromUserId(folderId, user.getId());
        for (CharacterModel c : chars) {
            c.setFolder(null);
        }
        characterRepository.saveAll(chars);

        folderRepository.delete(folder);
    }

    private FolderDTO toDTO(FolderModel folder) {
        return new FolderDTO(folder.getId(), folder.getName());
    }
}
