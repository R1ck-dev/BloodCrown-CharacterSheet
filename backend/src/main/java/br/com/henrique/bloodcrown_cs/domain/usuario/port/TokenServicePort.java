package br.com.henrique.bloodcrown_cs.domain.usuario.port;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;

/**
 * Porta de saída para geração/leitura de tokens JWT.
 * Adapter: JwtTokenAdapter (infrastructure/config/security).
 */
public interface TokenServicePort {
    String gerarToken(User user);
    String obterIdDoUsuario(String token);
    String obterRoleDoUsuario(String token);
}
