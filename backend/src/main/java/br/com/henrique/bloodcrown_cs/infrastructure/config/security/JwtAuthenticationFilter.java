package br.com.henrique.bloodcrown_cs.infrastructure.config.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.henrique.bloodcrown_cs.domain.usuario.port.TokenServicePort;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro JWT por requisição. Extrai o token do header Authorization, valida via
 * TokenServicePort e, se válido, define o principal como o userId (String) — não o
 * modelo de domínio. Tokens inválidos/expirados/antigos (sem o claim "id") são
 * ignorados silenciosamente, deixando a requisição seguir sem autenticação.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenServicePort tokenServicePort;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = recuperarToken(request);

        if (token != null) {
            try {
                String subjectId = tokenServicePort.obterIdDoUsuario(token);
                if (subjectId != null && !subjectId.isBlank()) {
                    String role = tokenServicePort.obterRoleDoUsuario(token);
                    var authorities = (role != null && !role.isBlank())
                            ? List.of(new SimpleGrantedAuthority(role))
                            : List.<SimpleGrantedAuthority>of();
                    var authentication = new UsernamePasswordAuthenticationToken(subjectId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception ignored) {
                // Assinatura inválida/expirada — segue sem autenticar (rota protegida devolve 401/403).
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
