package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * DTO de pasta de organizacao de fichas.
 *
 * @param id Identificador (ignorado em create).
 * @param name Nome da pasta.
 */
public record FolderDTO(
    String id,
    String name
) {}
