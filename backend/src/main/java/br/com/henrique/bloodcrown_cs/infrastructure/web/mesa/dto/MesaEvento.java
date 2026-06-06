package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Evento publicado em /topic/mesas/{id}. Tipos:
 *  - "mover": token arrastado ao vivo (tokenId/x/y/porUserId preenchidos);
 *  - "atualizada": mudança estrutural (add/remove token, mapa, grid, cena) — cliente re-busca o estado;
 *  - "regua": régua de medição ao vivo (x/y = início, x2/y2 = fim, cenaId, ativa=false limpa).
 */
public record MesaEvento(String tipo, String tokenId, Integer x, Integer y, Integer x2, Integer y2,
                         String cenaId, Boolean ativa, String porUserId) {

    public static MesaEvento mover(String tokenId, int x, int y, String porUserId) {
        return new MesaEvento("mover", tokenId, x, y, null, null, null, null, porUserId);
    }

    public static MesaEvento atualizada(String porUserId) {
        return new MesaEvento("atualizada", null, null, null, null, null, null, null, porUserId);
    }

    public static MesaEvento regua(String cenaId, int x1, int y1, int x2, int y2,
                                   boolean ativa, String porUserId) {
        return new MesaEvento("regua", null, x1, y1, x2, y2, cenaId, ativa, porUserId);
    }
}
