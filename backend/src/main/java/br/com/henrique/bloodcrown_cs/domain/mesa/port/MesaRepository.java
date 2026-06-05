package br.com.henrique.bloodcrown_cs.domain.mesa.port;

import java.util.List;
import java.util.Optional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;

/**
 * Porta de saída do agregado Mesa.
 * Adapter: MesaRepositoryAdapter (infrastructure/persistence/mesa/adapter).
 */
public interface MesaRepository {
    Mesa salvar(Mesa mesa);

    /** Carrega a mesa só se o usuário for dono ou participante; senão Optional vazio. */
    Optional<Mesa> buscarPorIdComAcesso(String id, String userId);

    /** Mesas onde o usuário é dono ou participante. */
    List<Mesa> listarPorUsuario(String userId);

    Optional<Mesa> buscarPorCodigo(String codigoConvite);

    /** Checagem leve de acesso (sem carregar o agregado) — usada na inscrição do tópico STOMP. */
    boolean existeComAcesso(String id, String userId);

    void deletar(String id);
}
