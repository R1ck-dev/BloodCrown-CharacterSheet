package br.com.henrique.bloodcrown_cs.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.CharacterModel;

@Repository
public interface CharacterRepository extends JpaRepository<CharacterModel, String>{
    List<CharacterModel> findByFromUserId(String userId);
    Optional<CharacterModel> findByIdAndFromUserId(String id, String userId);
    /** Lista fichas de uma pasta especifica do usuario — usado pelo FolderService.delete pra mover pra raiz. */
    List<CharacterModel> findByFolderIdAndFromUserId(String folderId, String userId);
}
