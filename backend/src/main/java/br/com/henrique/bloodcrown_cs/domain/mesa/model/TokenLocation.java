package br.com.henrique.bloodcrown_cs.domain.mesa.model;

/**
 * Localização de um token vinculado a uma ficha: em qual mesa ele está e se o status está visível.
 * Usado para descobrir, a partir de um characterId, onde fazer broadcast (status ao vivo / rolagem)
 * sem carregar o agregado Mesa inteiro.
 */
public record TokenLocation(String mesaId, String tokenId, boolean statusVisivel) {
}
