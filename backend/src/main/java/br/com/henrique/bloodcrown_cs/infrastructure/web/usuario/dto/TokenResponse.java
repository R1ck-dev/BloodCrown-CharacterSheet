package br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto;

/**
 * Resposta do login. Serializa como {"token": "..."} — mesmo shape do antigo ToLoginDTO.
 */
public record TokenResponse(String token) {}
