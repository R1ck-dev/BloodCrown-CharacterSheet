package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** Mensagem STOMP de movimento ao vivo (cliente → /app/mesas/{id}/mover). Não persiste. */
public record MoverTokenMessage(String tokenId, int x, int y) {}
