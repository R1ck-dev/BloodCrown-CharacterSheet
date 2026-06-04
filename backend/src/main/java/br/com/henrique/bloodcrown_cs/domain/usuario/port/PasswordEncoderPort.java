package br.com.henrique.bloodcrown_cs.domain.usuario.port;

/**
 * Porta de saída para codificação de senhas.
 * Adapter: BCryptPasswordEncoderAdapter (infrastructure/config/security).
 */
public interface PasswordEncoderPort {
    String encode(String rawPassword);
}
