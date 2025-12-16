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
} 
