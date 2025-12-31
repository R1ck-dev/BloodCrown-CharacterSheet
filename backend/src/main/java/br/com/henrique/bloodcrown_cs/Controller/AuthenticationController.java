package br.com.henrique.bloodcrown_cs.Controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.LoginDTO;
import br.com.henrique.bloodcrown_cs.DTOs.RegisterDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToLoginDTO;
import br.com.henrique.bloodcrown_cs.DTOs.Responses.ToRegisterDTO;
import br.com.henrique.bloodcrown_cs.Models.UserModel;
import br.com.henrique.bloodcrown_cs.Security.TokenService;
import br.com.henrique.bloodcrown_cs.Services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


/**
 * Controlador responsável pelo gerenciamento de autenticação e registro de usuários.
 * Manipula a emissão de tokens JWT e a criação de novas contas.
 */
@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthenticationController(UserService userService, AuthenticationManager authenticationManager, TokenService tokenService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    /**
     * Registra um novo usuário no sistema.
     * Criptografa a senha e salva o usuário no banco de dados através do serviço.
     * * @param registerDTO Objeto contendo os dados de registro (login, senha, role).
     * @return ResponseEntity com status 201 (Created) e os dados do usuário criado (sem a senha).
     */
    @PostMapping("/register")
    public ResponseEntity<ToRegisterDTO> registerUser(@RequestBody RegisterDTO registerDTO) {
        ToRegisterDTO newUser = userService.registerUser(registerDTO);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(newUser.getId()).toUri();

        return ResponseEntity.created(location).body(newUser);
    }

    /**
     * Autentica um usuário existente e gera um token JWT.
     * Utiliza o AuthenticationManager do Spring Security para validar as credenciais.
     * * @param loginDTO Objeto contendo username e password.
     * @return ResponseEntity contendo o token de acesso (JWT).
     */
    @PostMapping("/login")
    public ResponseEntity<ToLoginDTO> loginUser(@RequestBody LoginDTO loginDTO) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(loginDTO.username(), loginDTO.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((UserModel) auth.getPrincipal());
        
        return ResponseEntity.ok(new ToLoginDTO(token));
    }
    
    
}