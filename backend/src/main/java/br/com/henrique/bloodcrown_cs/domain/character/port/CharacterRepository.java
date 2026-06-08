package br.com.henrique.bloodcrown_cs.domain.character.port;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.FichaStatusSnapshot;

/**
 * Porta de saída do agregado Character. Além das buscas por id/usuário, expõe finders
 * por id de filho (ataque/habilidade/item/perícia) para carregar a raiz nos endpoints
 * que recebem apenas o id do filho.
 * Adapter: CharacterRepositoryAdapter (infrastructure/persistence/character/adapter).
 */
public interface CharacterRepository {

    Character salvar(Character character);

    Optional<Character> buscarPorIdEUsuario(String id, String userId);

    /** Checagem leve de posse (sem carregar o agregado) — usada no broadcast de rolagem. */
    boolean existePorIdEUsuario(String id, String userId);

    /**
     * Snapshots de status (vida/defesa/resistências) por id, SEM checar dono — a autorização vem
     * do acesso à mesa que pediu (o requester pode não ser dono da ficha vinculada ao token).
     * Usado pelo tabuleiro para desenhar as barras/selos. Uma única query (sem N+1).
     */
    List<FichaStatusSnapshot> buscarSnapshotsPorIds(Collection<String> characterIds);

    List<Character> buscarPorUsuario(String userId);

    List<Character> buscarPorPastaEUsuario(String folderId, String userId);

    void deletar(String id);

    Optional<Character> buscarPorAtaqueIdEUsuario(String attackId, String userId);

    Optional<Character> buscarPorHabilidadeIdEUsuario(String abilityId, String userId);

    Optional<Character> buscarPorItemIdEUsuario(String itemId, String userId);

    Optional<Character> buscarPorPericiaCustomizadaIdEUsuario(String customSkillId, String userId);
}
