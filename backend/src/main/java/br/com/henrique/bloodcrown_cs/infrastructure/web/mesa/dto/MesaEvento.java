package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/**
 * Evento publicado em /topic/mesas/{id}. Tipos:
 *  - "mover": token arrastado ao vivo (tokenId/x/y/porUserId preenchidos);
 *  - "atualizada": mudança estrutural (add/remove token, mapa, grid, cena) — cliente re-busca o estado;
 *  - "regua": régua de medição ao vivo (x/y = início, x2/y2 = fim, cenaId, ativa=false limpa);
 *  - "ficha": status da ficha vinculada mudou (tokenId + novo snapshot) — atualiza a barra ao vivo;
 *  - "rolagem": rolagem feita na ficha (tokenId + fonte/total/tipo/crítico/nome) — card acima do token.
 *
 * "ficha"/"rolagem" não carregam porUserId (todos veem, inclusive quem causou).
 */
public record MesaEvento(String tipo, String tokenId, Integer x, Integer y, Integer x2, Integer y2,
                         String cenaId, Boolean ativa, String porUserId,
                         FichaResumoDto ficha,
                         String rolagemSource, Integer rolagemTotal, String rolagemKind,
                         Boolean rolagemCritico, String rolagemNome) {

    public static MesaEvento mover(String tokenId, int x, int y, String porUserId) {
        return new MesaEvento("mover", tokenId, x, y, null, null, null, null, porUserId,
                null, null, null, null, null, null);
    }

    public static MesaEvento atualizada(String porUserId) {
        return new MesaEvento("atualizada", null, null, null, null, null, null, null, null,
                null, null, null, null, null, null);
    }

    public static MesaEvento regua(String cenaId, int x1, int y1, int x2, int y2,
                                   boolean ativa, String porUserId) {
        return new MesaEvento("regua", null, x1, y1, x2, y2, cenaId, ativa, porUserId,
                null, null, null, null, null, null);
    }

    public static MesaEvento ficha(String tokenId, FichaResumoDto ficha) {
        return new MesaEvento("ficha", tokenId, null, null, null, null, null, null, null,
                ficha, null, null, null, null, null);
    }

    public static MesaEvento rolagem(String tokenId, String source, int total, String kind,
                                     boolean critico, String nome) {
        return new MesaEvento("rolagem", tokenId, null, null, null, null, null, null, null,
                null, source, total, kind, critico, nome);
    }
}
