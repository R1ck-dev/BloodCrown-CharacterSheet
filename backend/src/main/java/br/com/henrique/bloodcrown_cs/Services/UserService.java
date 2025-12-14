package br.com.henrique.bloodcrown_cs.Services;

import br.com.henrique.bloodcrown_cs.DTOs.RegisterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToRegisterDTO;

public interface UserService {
    ToRegisterDTO registerUser(RegisterDTO registerDTO);
} 
