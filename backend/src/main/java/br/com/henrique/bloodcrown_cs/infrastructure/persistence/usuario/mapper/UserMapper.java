package br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.mapper;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.usuario.model.User;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.usuario.entity.UserJpaEntity;

@Component
public class UserMapper {

    public UserJpaEntity toEntity(User user) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.setId(user.getId());
        entity.setUsername(user.getUsername());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setRole(user.getRole());
        return entity;
    }

    public User toDomain(UserJpaEntity entity) {
        return new User(
            entity.getId(),
            entity.getUsername(),
            entity.getPasswordHash(),
            entity.getRole()
        );
    }
}
