package br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.adapter;

import java.util.Optional;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.UserRepository;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.mapper.UserMapper;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.repository.SpringDataUserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository springDataUserRepository;
    private final UserMapper userMapper;

    @Override
    public User salvar(User user) {
        return userMapper.toDomain(springDataUserRepository.save(userMapper.toEntity(user)));
    }

    @Override
    public Optional<User> buscarPorUsername(String username) {
        return springDataUserRepository.findByUsername(username).map(userMapper::toDomain);
    }
}
