package br.com.henrique.bloodcrown_cs.domain.character.port;

import br.com.henrique.bloodcrown_cs.domain.character.model.RolagemPayload;

/**
 * Porta de saída do lado Character para avisar o tabuleiro (Mesa) sobre mudanças da ficha, sem
 * acoplar o agregado Character ao agregado Mesa. Implementada na infraestrutura por um adapter que
 * conhece a mesa + o canal STOMP. No-op quando a ficha não tem token em mesa nenhuma.
 */
public interface TabletopNotifierPort {

    /** Rebroadcasta uma rolagem da ficha aos tokens dela (card transitório acima do token). */
    void notificarRolagem(String characterId, RolagemPayload payload);
}
