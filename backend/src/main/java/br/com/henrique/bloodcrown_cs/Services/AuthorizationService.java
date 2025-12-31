package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.Repositories.UserRepository;

/**
 * Serviço responsável por integrar a lógica de usuários do sistema com o Spring Security.
 * Implementa UserDetailsService para permitir que o Spring Security carregue dados de usuários
 * durante o processo de autenticação.
 */
@Service
public class AuthorizationService implements UserDetailsService {

    private final UserRepository userRepository;

    public AuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Busca um usuário no banco de dados pelo nome de usuário (username).
     * Método obrigatório da interface UserDetailsService, utilizado internamente pelo AuthenticationManager.
     * * @param username O nome de usuário fornecido no login.
     * @return Um objeto UserDetails (no caso, UserModel) se encontrado.
     * @throws UsernameNotFoundException Se o usuário não existir no banco.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário {" + username + "} não encontrado."));
    }
    
}