package br.com.henrique.bloodcrown_cs.Security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Classe de configuração principal do Spring Security.
 * Define as regras de autenticação, criptografia de senhas, gerenciamento de sessão
 * e políticas de CORS (Cross-Origin Resource Sharing).
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
    
    private final SecurityFilter securityFilter;

    public WebSecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    /**
     * Define o algoritmo de criptografia de senhas (BCrypt) utilizado pelo sistema.
     * Essencial para garantir que as senhas não sejam salvas em texto plano no banco.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Expõe o AuthenticationManager do Spring como um Bean para ser utilizado nos Controllers.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Configura a cadeia de filtros de segurança (Security Filter Chain).
     * - Desabilita CSRF (padrão para APIs Stateless).
     * - Configura CORS.
     * - Define a sessão como STATELESS (sem estado, obrigando o uso de token em cada requisição).
     * - Define as regras de autorização para cada endpoint (rotas públicas vs privadas).
     * - Adiciona o filtro de token personalizado antes do filtro padrão do Spring.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/characters").permitAll()
                        .requestMatchers(HttpMethod.POST, "/characters").permitAll()
                        .requestMatchers(HttpMethod.GET, "/characters/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/attacks/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/attacks/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/abilities/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/abilities/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Define as configurações de CORS (Cross-Origin Resource Sharing).
     * Permite que o Frontend (hospedado no Netlify ou rodando localmente)
     * faça requisições para esta API.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5500",      
            "http://localhost:8080",      
            "http://127.0.0.1:5500",      
            "https://bloodcrown.netlify.app" 
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}