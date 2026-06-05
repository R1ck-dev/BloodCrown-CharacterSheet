package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.entity.MesaJpaEntity;

@Repository
public interface SpringDataMesaRepository extends JpaRepository<MesaJpaEntity, String> {

    @Query("SELECT m FROM MesaJpaEntity m WHERE m.id = :id "
            + "AND (m.dono.id = :userId OR :userId MEMBER OF m.participantes)")
    Optional<MesaJpaEntity> findByIdComAcesso(@Param("id") String id, @Param("userId") String userId);

    @Query("SELECT DISTINCT m FROM MesaJpaEntity m "
            + "WHERE m.dono.id = :userId OR :userId MEMBER OF m.participantes ORDER BY m.nome ASC")
    List<MesaJpaEntity> listarPorUsuario(@Param("userId") String userId);

    Optional<MesaJpaEntity> findByCodigoConvite(String codigoConvite);

    @Query("SELECT COUNT(m) > 0 FROM MesaJpaEntity m WHERE m.id = :id "
            + "AND (m.dono.id = :userId OR :userId MEMBER OF m.participantes)")
    boolean existeComAcesso(@Param("id") String id, @Param("userId") String userId);
}
