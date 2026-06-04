package br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.folder.entity.FolderJpaEntity;

@Repository
public interface SpringDataFolderRepository extends JpaRepository<FolderJpaEntity, String> {
    List<FolderJpaEntity> findByUser_IdOrderByNameAsc(String userId);
    Optional<FolderJpaEntity> findByIdAndUser_Id(String id, String userId);
}
