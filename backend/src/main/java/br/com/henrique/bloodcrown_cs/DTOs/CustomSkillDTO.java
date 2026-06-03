package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * DTO de perícia personalizada. Usado tanto na request (create/update — id ignorado
 * no create) quanto na response, seguindo o padrão simples de {@link AttackDTO}.
 *
 * @param id Identificador único (gerado no servidor).
 * @param name Nome da perícia.
 * @param attribute Atributo de vínculo ("forca", "destreza", "constituicao",
 *                  "inteligencia", "sabedoria", "carisma").
 * @param value Bônus somado ao atributo na rolagem.
 */
public record CustomSkillDTO(
    String id,
    String name,
    String attribute,
    Integer value
) {

}
