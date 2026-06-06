package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Mensagem STOMP da régua de medição ao vivo (não persiste). x1/y1 = início, x2/y2 = fim
 * (px do mapa); ativa=false limpa a régua nos outros clientes. cenaId indica em qual cena medir.
 */
public record ReguaMessage(String cenaId, int x1, int y1, int x2, int y2, boolean ativa) {}
