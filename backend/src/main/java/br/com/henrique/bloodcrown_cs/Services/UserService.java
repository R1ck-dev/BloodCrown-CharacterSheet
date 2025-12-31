package br.com.henrique.bloodcrown_cs.Services;

import br.com.henrique.bloodcrown_cs.DTOs.RegisterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToRegisterDTO;

/**
 * Interface responsável pelas regras de negócio referentes à gestão de usuários.
 */
public interface UserService {

    /**
     * Processa o registro de um novo usuário no sistema.
     * Deve verificar a disponibilidade do nome de usuário e realizar a criptografia da senha.
     * * @param registerDTO Dados de entrada (username e senha bruta).
     * @return DTO de resposta contendo o ID e Username do usuário criado (sem a senha).
     */
    ToRegisterDTO registerUser(RegisterDTO registerDTO);
}