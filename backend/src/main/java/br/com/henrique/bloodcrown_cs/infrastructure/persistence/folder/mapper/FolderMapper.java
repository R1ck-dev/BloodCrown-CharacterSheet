package br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.mapper;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.entity.FolderJpaEntity;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FolderMapper {

    private final EntityManager entityManager;

    public FolderJpaEntity toEntity(Folder folder) {
        FolderJpaEntity entity = new FolderJpaEntity();
        entity.setId(folder.getId());
        entity.setName(folder.getName());
        entity.setUser(entityManager.getReference(UserJpaEntity.class, folder.getOwnerUserId()));
        return entity;
    }

    public Folder toDomain(FolderJpaEntity entity) {
        return new Folder(
            entity.getId(),
            entity.getName(),
            entity.getUser() != null ? entity.getUser().getId() : null
        );
    }
}
