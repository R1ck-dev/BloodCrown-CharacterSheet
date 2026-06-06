package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Evento publicado em /topic/mesas/{id}. Dois tipos:
 *  - "mover": token arrastado ao vivo (tokenId/x/y/porUserId preenchidos);
 *  - "atualizada": mudança estrutural (add/remove token, mapa, grid) — cliente re-busca o estado.
 */
public record MesaEvento(String tipo, String tokenId, Integer x, Integer y, String porUserId) {

    public static MesaEvento mover(String tokenId, int x, int y, String porUserId) {
        return new MesaEvento("mover", tokenId, x, y, porUserId);
    }

    public static MesaEvento atualizada(String porUserId) {
        return new MesaEvento("atualizada", null, null, null, porUserId);
    }
}
