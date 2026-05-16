package br.com.henrique.bloodcrown_cs.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.AttackModel;

@Repository
public interface AttackRepository extends JpaRepository<AttackModel, String>{

    Optional<AttackModel> findByIdAndCharacter_FromUserId(String id, String userId);
}
