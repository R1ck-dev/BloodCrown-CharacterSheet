package br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.usuario.dto.LoginInput;
import br.com.henrique.bloodcrown_cs.application.usuario.dto.RegistrarUsuarioInput;
import br.com.henrique.bloodcrown_cs.application.usuario.usecase.AutenticarUsuarioUseCase;
import br.com.henrique.bloodcrown_cs.application.usuario.usecase.RegistrarUsuarioUseCase;
import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto.LoginRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto.RegisterRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto.RegisteredUserResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto.TokenResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Adapter de entrada para autenticação e registro. Mantém as rotas /auth/register
 * e /auth/login e os mesmos shapes de resposta do MVC anterior.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final RegistrarUsuarioUseCase registrarUsuarioUseCase;
    private final AutenticarUsuarioUseCase autenticarUsuarioUseCase;

    @PostMapping("/register")
    public ResponseEntity<RegisteredUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User created = registrarUsuarioUseCase.execute(
            new RegistrarUsuarioInput(request.username(), request.password())
        );

        RegisteredUserResponse body = new RegisteredUserResponse(created.getId(), created.getUsername());

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.getId()).toUri();

        return ResponseEntity.created(location).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = autenticarUsuarioUseCase.execute(
            new LoginInput(request.username(), request.password())
        );
        return ResponseEntity.ok(new TokenResponse(token));
    }
}
