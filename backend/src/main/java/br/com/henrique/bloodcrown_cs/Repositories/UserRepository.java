package br.com.henrique.bloodcrown_cs.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.UserModel;

@Repository
public interface UserRepository extends JpaRepository<UserModel, String>{
    Optional<UserModel> findByUsername(String username);
} 