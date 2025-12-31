package br.com.henrique.bloodcrown_cs.DTOs;

/**
 * Representa o conjunto de Atributos base de um personagem.
 * Estes valores são fundamentais para o cálculo de modificadores e testes de resistência.
 * * @param forca Mede a potência muscular e física.
 * @param destreza Mede a agilidade, reflexos e equilíbrio.
 * @param sabedoria Mede a percepção, intuição e força de vontade.
 * @param inteligencia Mede a acuidade mental, raciocínio e memória.
 * @param carisma Mede a força da personalidade e capacidade de liderança.
 * @param constituicao Mede a saúde, vigor e resistência física.
 */
public record AttributesDTO(
    Integer forca,
    Integer destreza,
    Integer sabedoria,
    Integer inteligencia,
    Integer carisma,
    Integer constituicao
) {
}