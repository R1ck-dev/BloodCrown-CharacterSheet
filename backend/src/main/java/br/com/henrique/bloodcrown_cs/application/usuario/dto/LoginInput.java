package br.com.henrique.bloodcrown_cs.application.usuario.dto;

/**
 * Credenciais de entrada do caso de uso de autenticação.
 */
public record LoginInput(
    String username,
    String password
) {}
