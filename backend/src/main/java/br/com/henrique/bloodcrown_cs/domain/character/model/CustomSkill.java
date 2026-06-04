package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Sub-entidade: perícia personalizada (nome + atributo de vínculo + bônus).
 */
@Getter
@Setter
public class CustomSkill {
    private String id;
    private String name;
    private String attribute;
    private Integer value;

    /** Cria uma nova perícia personalizada já com id gerado. */
    public static CustomSkill create(String name, String attribute, Integer value) {
        CustomSkill s = new CustomSkill();
        s.id = UUID.randomUUID().toString();
        s.name = name;
        s.attribute = attribute;
        s.value = value;
        return s;
    }
}
