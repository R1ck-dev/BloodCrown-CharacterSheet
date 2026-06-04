package br.com.henrique.bloodcrown_cs.domain.folder.model;

import java.util.UUID;

import lombok.Getter;

/**
 * Modelo de domínio da pasta de organização de fichas. Estrutura flat (sem aninhamento),
 * pertencente a um usuário.
 */
@Getter
public class Folder {

    private final String id;
    private String name;
    private final String ownerUserId;

    public Folder(String id, String name, String ownerUserId) {
        this.id = (id != null && !id.isBlank()) ? id : UUID.randomUUID().toString();
        this.name = name;
        this.ownerUserId = ownerUserId;
    }

    /** Cria uma nova pasta com id gerado. */
    public static Folder criar(String name, String ownerUserId) {
        return new Folder(null, name, ownerUserId);
    }

    public void renomear(String name) {
        this.name = name;
    }
}
