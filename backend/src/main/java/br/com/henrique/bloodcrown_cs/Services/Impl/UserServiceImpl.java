package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.RegisterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToRegisterDTO;
import br.com.henrique.bloodcrown_cs.Enums.UserRoleEnum;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.UserRepository;
import br.com.henrique.bloodcrown_cs.Services.UserService;

/**
 * Implementação do serviço de gerenciamento de usuários.
 * Lida com a criação de contas e segurança de senhas.
 */
@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

//--------------------------------Registro de Usuário--------------------------------
    /**
     * Registra um novo usuário no sistema.
     * Converte o DTO de entrada em uma entidade UserModel, aplica a codificação (hash)
     * na senha utilizando o PasswordEncoder e define o papel (Role) inicial.
     * * @param registerDTO Dados de registro (usuário e senha).
     * @return DTO contendo as informações públicas do usuário criado.
     */
    @Override
    public ToRegisterDTO registerUser(RegisterDTO registerDTO) {
        UserModel userModel = new UserModel();

        userModel.setUsername(registerDTO.username());
        userModel.setPassword(passwordEncoder.encode(registerDTO.password()));
        userModel.setRole(UserRoleEnum.ROLE_ADMIN); //Temporariamente

        userRepository.save(userModel);

        return modelToDtoRegister(registerDTO, userModel.getId());
    }
    
    /**
     * Método auxiliar para converter dados de registro e ID gerado em um DTO de resposta.
     * * @param registerDTO Dados originais de entrada.
     * @param id ID gerado pelo banco de dados.
     * @return Objeto de resposta formatado.
     */
    public ToRegisterDTO modelToDtoRegister(RegisterDTO registerDTO, String id) {
        ToRegisterDTO dto = new ToRegisterDTO();

        dto.setId(id);
        dto.setUsername(registerDTO.username());
        
        return dto;
    }
//-------------------------------------------------------------------------------
}