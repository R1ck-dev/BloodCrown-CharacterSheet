package br.com.henrique.bloodcrown_cs.application.usuario.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.usuario.dto.RegistrarUsuarioInput;
import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.PasswordEncoderPort;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Registra um novo usuário: codifica a senha e persiste com papel padrão.
 */
@Service
@RequiredArgsConstructor
public class RegistrarUsuarioUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoderPort passwordEncoderPort;

    @Transactional
    public User execute(RegistrarUsuarioInput input) {
        String hash = passwordEncoderPort.encode(input.password());
        User novoUsuario = User.registrar(input.username(), hash);
        return userRepository.salvar(novoUsuario);
    }
}
