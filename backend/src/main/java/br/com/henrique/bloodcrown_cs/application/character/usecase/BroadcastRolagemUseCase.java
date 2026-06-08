package br.com.henrique.bloodcrown_cs.application.character.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.model.RolagemPayload;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.character.port.TabletopNotifierPort;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Rebroadcasta uma rolagem feita na ficha para os tokens dela no tabuleiro. Só o dono da ficha pode
 * disparar (valida posse); sem escrita no banco — só dispara o evento STOMP via TabletopNotifierPort.
 */
@Service
@RequiredArgsConstructor
public class BroadcastRolagemUseCase {

    private final CharacterRepository characterRepository;
    private final TabletopNotifierPort tabletopNotifier;

    @Transactional(readOnly = true)
    public void execute(String characterId, String userId, RolagemPayload payload) {
        if (!characterRepository.existePorIdEUsuario(characterId, userId)) {
            throw new NotFoundException("Ficha não encontrada ou permissão negada.");
        }
        tabletopNotifier.notificarRolagem(characterId, payload);
    }
}
