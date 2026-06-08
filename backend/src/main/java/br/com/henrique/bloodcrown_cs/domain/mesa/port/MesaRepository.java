package br.com.henrique.bloodcrown_cs.domain.mesa.port;

import java.util.List;
import java.util.Optional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenLocation;

/**
 * Porta de saída do agregado Mesa.
 * Adapter: MesaRepositoryAdapter (infrastructure/persistence/mesa/adapter).
 */
public interface MesaRepository {
    Mesa salvar(Mesa mesa);

    /**
     * Localizações (mesa + token + statusVisivel) de todos os tokens vinculados a uma ficha, em
     * qualquer mesa/cena. Usado para broadcast ao vivo de status e card de rolagem. 1 query, sem
     * carregar o agregado.
     */
    List<TokenLocation> buscarTokensPorCharacterId(String characterId);

    /** Carrega a mesa só se o usuário for dono ou participante; senão Optional vazio. */
    Optional<Mesa> buscarPorIdComAcesso(String id, String userId);

    /** Mesas onde o usuário é dono ou participante. */
    List<Mesa> listarPorUsuario(String userId);

    Optional<Mesa> buscarPorCodigo(String codigoConvite);

    /** Checagem leve de acesso (sem carregar o agregado) — usada na inscrição do tópico STOMP. */
    boolean existeComAcesso(String id, String userId);

    void deletar(String id);
}
