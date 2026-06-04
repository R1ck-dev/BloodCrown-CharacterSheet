package br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.adapter;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.domain.folder.port.FolderRepository;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.mapper.FolderMapper;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.repository.SpringDataFolderRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FolderRepositoryAdapter implements FolderRepository {

    private final SpringDataFolderRepository springDataFolderRepository;
    private final FolderMapper folderMapper;

    @Override
    public Folder salvar(Folder folder) {
        return folderMapper.toDomain(springDataFolderRepository.save(folderMapper.toEntity(folder)));
    }

    @Override
    public List<Folder> listarPorUsuario(String userId) {
        return springDataFolderRepository.findByUser_IdOrderByNameAsc(userId).stream()
                .map(folderMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Folder> buscarPorIdEUsuario(String id, String userId) {
        return springDataFolderRepository.findByIdAndUser_Id(id, userId).map(folderMapper::toDomain);
    }

    @Override
    public void deletar(String id) {
        springDataFolderRepository.deleteById(id);
    }
}
