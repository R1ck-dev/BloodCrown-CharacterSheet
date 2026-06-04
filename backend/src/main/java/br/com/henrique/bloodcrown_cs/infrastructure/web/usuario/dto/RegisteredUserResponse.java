package br.com.henrique.bloodcrown_cs.infrastructure.web.usuario.dto;

/**
 * Resposta do registro. Serializa como {"id": "...", "username": "..."} —
 * mesmo shape do antigo ToRegisterDTO.
 */
public record RegisteredUserResponse(String id, String username) {}
