package br.com.henrique.bloodcrown_cs.infrastructure.config.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.TokenServicePort;

/**
 * Adapter de token JWT sobre a lib com.auth0:java-jwt (HMAC256).
 * Preserva issuer "bloodcrown-cs", subject = username e expiry de 5h (UTC-3) do
 * antigo TokenService, acrescentando os claims "id" (userId) e "role" — lidos pelo
 * JwtAuthenticationFilter para popular o principal como String.
 */
@Component
public class JwtTokenAdapter implements TokenServicePort {

    private static final String ISSUER = "bloodcrown-cs";

    @Value("${jwt.secret}")
    private String secret;

    @Override
    public String gerarToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(user.getUsername())
                    .withClaim("id", user.getId())
                    .withClaim("role", user.getRole().name())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error while generating token", exception);
        }
    }

    @Override
    public String obterIdDoUsuario(String token) {
        return decode(token).getClaim("id").asString();
    }

    @Override
    public String obterRoleDoUsuario(String token) {
        return decode(token).getClaim("role").asString();
    }

    /**
     * Verifica assinatura + issuer e devolve o token decodificado.
     * Lança JWTVerificationException se inválido/expirado (o filtro trata).
     */
    private DecodedJWT decode(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.require(algorithm).withIssuer(ISSUER).build().verify(token);
    }

    /**
     * 5 horas a partir de agora, ancorado em -03:00 (Brasília), como no TokenService original.
     */
    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(5).toInstant(ZoneOffset.of("-03:00"));
    }
}
