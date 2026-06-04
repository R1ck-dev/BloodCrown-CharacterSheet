package br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto;

/** Body do PATCH /characters/{id}/folder. null/vazio = move pra raiz. */
public record MoveToFolderRequest(String folderId) {}
