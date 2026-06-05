package br.com.henrique.bloodcrown_cs.infrastructure.config.realtime;

import java.security.Principal;

/** Principal mínimo do canal STOMP: o name é o userId (igual ao principal do REST). */
public record StompPrincipal(String userId) implements Principal {

    @Override
    public String getName() {
        return userId;
    }
}
