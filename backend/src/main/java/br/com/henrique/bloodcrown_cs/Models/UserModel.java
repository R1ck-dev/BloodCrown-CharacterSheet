package br.com.henrique.bloodcrown_cs.Models;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import br.com.henrique.bloodcrown_cs.Enums.UserRoleEnum;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class UserModel implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "VARCHAR(36)", updatable = false, unique = true, nullable = false)
    private String id;

    @Column(name = "username", length = 25, updatable = true, unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", length = 255, updatable = true, unique = false, nullable = false)
    private String password;

    // mappedBy -> indicando um relacionamento, informando que a "cabeça da relação" é a classe Characters, no campo determinado como "fromUser"
    // cascade = CascadeType.ALL -> Se deletar o usuário, o BD deleta todas as fichas dele automaticamente
    @OneToMany(mappedBy = "fromUser", cascade = CascadeType.ALL)
    private List<CharacterModel> charactersList;

    @Column(name = "roles", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRoleEnum role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == UserRoleEnum.ROLE_ADMIN) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override 
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
