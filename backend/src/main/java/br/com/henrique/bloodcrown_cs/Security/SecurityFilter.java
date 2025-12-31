package br.com.henrique.bloodcrown_cs.Security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de segurança que intercepta todas as requisições HTTP para validar o token JWT.
 * Executa uma vez por requisição (OncePerRequestFilter) antes que a requisição chegue aos Controllers.
 */
@Component
public class SecurityFilter extends OncePerRequestFilter {
    
    private final TokenService tokenService;
    private final UserDetailsService userDetailsService;

    public SecurityFilter(TokenService tokenService, UserDetailsService userDetailsService) {
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Lógica principal de filtragem.
     * Recupera o token do cabeçalho, valida sua autenticidade e, se válido,
     * autentica o usuário no contexto de segurança do Spring.
     * * @param request A requisição HTTP recebida.
     * @param response A resposta HTTP.
     * @param filterChain A cadeia de filtros a ser seguida.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        var token = this.recoverToken(request);

        if (token != null) {
            var username = tokenService.validateToken(token);
            if (username != null && !username.isEmpty()) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                if (user != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Extrai o token JWT do cabeçalho "Authorization" da requisição.
     * Remove o prefixo padrão "Bearer " para obter apenas o token bruto.
     * * @param request A requisição HTTP.
     * @return O token JWT ou null se o cabeçalho estiver ausente/inválido.
     */
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}