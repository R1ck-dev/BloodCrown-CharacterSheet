package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Patch parcial da ficha de personagem — todos os campos opcionais (null = no-op).
 * Usado pelo PATCH /characters/{id} disparado pelo auto-save: o front rastreia
 * dirtyFields do React Hook Form e manda so o diff, em vez de PUT do agregado
 * inteiro.
 *
 * Nao inclui listas (attacks/abilities/inventory) porque essas tem endpoints
 * dedicados (POST/PUT/DELETE em /attacks, /abilities, /items) e cada mutation
 * ja sincroniza o cache do front via setQueryData.
 *
 * No service, sub-DTOs (attributes/status/expertise/actionPool) tambem
 * obedecem ao padrao: null no objeto pai = nao mexe; null em campo interno
 * = nao mexe naquele campo individual.
 */
public record CharacterPatchDTO(
    String name,
    String characterClass,
    Integer level,
    AttributesDTO attributes,
    StatusDTO status,
    ExpertiseDTO expertise,
    String money,
    Integer heroPoint,
    String biography,
    ActionPoolDTO actionPool
) {
}
