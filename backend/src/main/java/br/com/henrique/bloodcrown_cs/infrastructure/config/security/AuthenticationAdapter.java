package br.com.henrique.bloodcrown_cs.infrastructure.config.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.AuthenticationPort;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Autenticação de credenciais sem AuthenticationManager/UserDetailsService:
 * carrega o usuário pela porta de repositório e compara a senha com o BCrypt.
 * Credenciais inválidas → BadRequestException (400), mesma mensagem para usuário
 * inexistente e senha errada (evita enumeração e não dispara o handler de 401 do front).
 */
@Component
@RequiredArgsConstructor
public class AuthenticationAdapter implements AuthenticationPort {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User autenticar(String username, String rawPassword) {
        User user = userRepository.buscarPorUsername(username)
                .orElseThrow(() -> new BadRequestException("Usuário ou senha inválidos."));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadRequestException("Usuário ou senha inválidos.");
        }

        return user;
    }
}
