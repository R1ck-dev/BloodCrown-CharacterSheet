package br.com.henrique.bloodcrown_cs.Services.Impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.henrique.bloodcrown_cs.DTOs.RegisterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToRegisterDTO;
import br.com.henrique.bloodcrown_cs.Enums.UserRoleEnum;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Repositories.UserRepository;
import br.com.henrique.bloodcrown_cs.Services.UserService;

@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

//--------------------------------Registro de Usuário--------------------------------
    @Override
    public ToRegisterDTO registerUser(RegisterDTO registerDTO) {
        UserModel userModel = new UserModel();

        userModel.setUsername(registerDTO.username());
        userModel.setPassword(passwordEncoder.encode(registerDTO.password()));
        userModel.setRole(UserRoleEnum.ROLE_ADMIN); //Temporariamente

        userRepository.save(userModel);

        return modelToDtoRegister(registerDTO, userModel.getId());
    }
    
    public ToRegisterDTO modelToDtoRegister(RegisterDTO registerDTO, String id) {
        ToRegisterDTO dto = new ToRegisterDTO();

        dto.setId(id);
        dto.setUsername(registerDTO.username());
        
        return dto;
    }
//-------------------------------------------------------------------------------
}
