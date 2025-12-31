package br.com.henrique.bloodcrown_cs.Security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import br.com.henrique.bloodcrown_cs.Models.UserModel;

/**
 * Serviço responsável pelo gerenciamento de tokens JWT (JSON Web Token).
 * Realiza a geração de tokens assinados para usuários autenticados e a validação
 * de tokens recebidos nas requisições.
 */
@Service
public class TokenService {
    
    /**
     * Chave secreta utilizada para assinar e verificar a integridade dos tokens.
     * Injetada a partir das variáveis de ambiente ou arquivo de propriedades.
     */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * Gera um novo token JWT assinado para um usuário autenticado.
     * O token contém o "issuer" (emissor), o "subject" (username) e a data de expiração.
     * * @param userModel O usuário para o qual o token será gerado.
     * @return A String contendo o token JWT assinado.
     */
    public String generateToken(UserModel userModel) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String token = JWT.create()
                    .withIssuer("bloodcrown-cs")
                    .withSubject(userModel.getUsername())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
                return token;
        } catch (JWTCreationException exception){
            throw new RuntimeException("Error while generating token", exception);
        }
    }

    /**
     * Valida a assinatura e a integridade do token recebido.
     * Verifica se o token foi emitido por esta aplicação e se ainda é válido.
     * * @param token O token JWT a ser validado.
     * @return O "subject" (username) contido no token se válido, ou uma string vazia caso contrário.
     */
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("bloodcrown-cs")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception){
            return "";
        }
    }

    /**
     * Calcula o tempo de expiração do token.
     * Define o fuso horário para -03:00 (Brasília/UTC-3) e adiciona 5 horas ao tempo atual.
     * * @return O instante exato da expiração.
     */
    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(5).toInstant(ZoneOffset.of("-03:00"));
    }
}