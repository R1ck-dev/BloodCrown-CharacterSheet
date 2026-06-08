package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.domain.character.model.FichaStatusSnapshot;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.entity.CharacterJpaEntity;

/**
 * Otimização de N+1: as coleções de CharacterJpaEntity (e AbilityJpaEntity.effects)
 * usam @BatchSize(20) — o Hibernate carrega cada coleção em 1 query batch, não via
 * @EntityGraph com múltiplas List<> (que dispararia MultipleBagFetchException).
 * Os finders por id de filho navegam na coleção (Attacks_Id, Abilities_Id, ...) + user.
 */
@Repository
public interface SpringDataCharacterRepository extends JpaRepository<CharacterJpaEntity, String> {

    List<CharacterJpaEntity> findByUser_Id(String userId);

    Optional<CharacterJpaEntity> findByIdAndUser_Id(String id, String userId);

    boolean existsByIdAndUser_Id(String id, String userId);

    List<CharacterJpaEntity> findByFolder_IdAndUser_Id(String folderId, String userId);

    Optional<CharacterJpaEntity> findByAttacks_IdAndUser_Id(String attackId, String userId);

    Optional<CharacterJpaEntity> findByAbilities_IdAndUser_Id(String abilityId, String userId);

    Optional<CharacterJpaEntity> findByInventory_IdAndUser_Id(String itemId, String userId);

    Optional<CharacterJpaEntity> findByCustomSkills_IdAndUser_Id(String customSkillId, String userId);

    /** Projeção do status (vida/defesa/resistências) por id — 1 query, sem carregar o agregado. */
    @Query("""
            SELECT new br.com.henrique.bloodcrown_cs.domain.character.model.FichaStatusSnapshot(
                c.id, c.name, c.status.currentHealth, c.status.maxHealth,
                c.status.defense, c.status.physicalRes, c.status.magicalRes)
            FROM CharacterJpaEntity c
            WHERE c.id IN :ids""")
    List<FichaStatusSnapshot> buscarSnapshotsPorIds(@Param("ids") Collection<String> ids);
}
