package br.com.henrique.bloodcrown_cs.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.CustomSkillModel;

@Repository
public interface CustomSkillRepository extends JpaRepository<CustomSkillModel, String> {

    /**
     * Busca uma perícia validando posse: id da perícia + id do usuário dono do personagem.
     * Mesmo padrão de AttackRepository — usado em update/delete pra garantir ownership.
     */
    Optional<CustomSkillModel> findByIdAndCharacter_FromUserId(String id, String userId);
}
