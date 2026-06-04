package br.com.henrique.bloodcrown_cs.domain.usuario.port;

import java.util.Optional;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;

/**
 * Porta de saída para persistência de usuários.
 * Adapter: UserRepositoryAdapter (infrastructure/persistence/usuario/adapter).
 */
public interface UserRepository {
    User salvar(User user);
    Optional<User> buscarPorUsername(String username);
}
