package br.com.henrique.bloodcrown_cs.application.usuario.usecase;

import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.application.usuario.dto.LoginInput;
import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.AuthenticationPort;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.TokenServicePort;

import lombok.RequiredArgsConstructor;

/**
 * Autentica as credenciais e devolve um token JWT assinado.
 */
@Service
@RequiredArgsConstructor
public class AutenticarUsuarioUseCase {

    private final AuthenticationPort authenticationPort;
    private final TokenServicePort tokenServicePort;

    public String execute(LoginInput input) {
        User usuarioAutenticado = authenticationPort.autenticar(input.username(), input.password());
        return tokenServicePort.gerarToken(usuarioAutenticado);
    }
}
