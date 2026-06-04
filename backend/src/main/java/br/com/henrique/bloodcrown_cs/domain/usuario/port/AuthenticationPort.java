package br.com.henrique.bloodcrown_cs.domain.usuario.port;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;

/**
 * Porta de saída para autenticação de credenciais.
 * Adapter: AuthenticationAdapter (infrastructure/config/security).
 */
public interface AuthenticationPort {
    User autenticar(String username, String rawPassword);
}
