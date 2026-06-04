package br.com.henrique.bloodcrown_cs.domain.character.model;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

/**
 * Sub-entidade: item de inventário (equipável e/ou consumível).
 */
@Getter
@Setter
public class Item {
    private String id;
    private String name;
    private String description;
    private Boolean isEquipped = false;
    private String targetAttribute;
    private Integer effectValue;
    private Integer quantity = 1;
    private String useDice;

    /** Cria um novo item já com id gerado, desequipado, quantidade saneada (mín. 0, default 1). */
    public static Item create(String name, String description, String targetAttribute,
                              Integer effectValue, Integer quantity, String useDice) {
        Item i = new Item();
        i.id = UUID.randomUUID().toString();
        i.name = name;
        i.description = description;
        i.targetAttribute = targetAttribute;
        i.effectValue = effectValue;
        i.quantity = quantity != null ? Math.max(0, quantity) : 1;
        i.useDice = useDice;
        i.isEquipped = false;
        return i;
    }
}
