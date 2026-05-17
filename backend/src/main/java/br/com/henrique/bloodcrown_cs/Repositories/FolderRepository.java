package br.com.henrique.bloodcrown_cs.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.FolderModel;

@Repository
public interface FolderRepository extends JpaRepository<FolderModel, String> {
    List<FolderModel> findByFromUserIdOrderByNameAsc(String userId);
    Optional<FolderModel> findByIdAndFromUserId(String id, String userId);
}
