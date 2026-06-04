package br.com.henrique.bloodcrown_cs.infrastructure.config.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.usuario.port.PasswordEncoderPort;

import lombok.RequiredArgsConstructor;

/**
 * Adapter que delega a codificação de senha ao PasswordEncoder do Spring (BCrypt).
 */
@Component
@RequiredArgsConstructor
public class BCryptPasswordEncoderAdapter implements PasswordEncoderPort {

    private final PasswordEncoder passwordEncoder;

    @Override
    public String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
