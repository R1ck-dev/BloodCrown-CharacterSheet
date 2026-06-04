package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Sub-entidade do agregado Character: um ataque/arma. Mutável (gerida pela raiz).
 */
@Getter
@Setter
public class Attack {
    private String id;
    private String name;
    private String damageDice;
    private String description;

    /** Cria um novo ataque já com id gerado. */
    public static Attack create(String name, String damageDice, String description) {
        Attack a = new Attack();
        a.id = UUID.randomUUID().toString();
        a.name = name;
        a.damageDice = damageDice;
        a.description = description;
        return a;
    }
}
