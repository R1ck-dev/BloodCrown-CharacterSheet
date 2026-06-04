package br.com.henrique.bloodcrown_cs.application.usuario.dto;

/**
 * Dados de entrada do caso de uso de registro de usuário.
 */
public record RegistrarUsuarioInput(
    String username,
    String password
) {}
