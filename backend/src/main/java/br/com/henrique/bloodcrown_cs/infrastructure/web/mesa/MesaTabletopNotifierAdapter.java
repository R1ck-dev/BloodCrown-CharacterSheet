package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import br.com.henrique.bloodcrown_cs.application.character.event.FichaStatusAlteradaEvent;
import br.com.henrique.bloodcrown_cs.domain.character.model.FichaStatusSnapshot;
import br.com.henrique.bloodcrown_cs.domain.character.model.RolagemPayload;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.character.port.TabletopNotifierPort;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenLocation;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.FichaResumoDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaEvento;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.mapper.MesaWebMapper;

import lombok.RequiredArgsConstructor;

/**
 * Ponte Character → Mesa (tabletop): descobre os tokens vinculados a uma ficha e emite os eventos
 * STOMP correspondentes. É o único ponto que conhece os dois agregados + o canal realtime, mantendo
 * o domínio de Character desacoplado de Mesa.
 *
 *  - Status ao vivo: reage ao FichaStatusAlteradaEvent APÓS O COMMIT (lê o snapshot já persistido) e
 *    emite "ficha" só para tokens com status visível.
 *  - Rolagem: implementa a porta TabletopNotifierPort (chamada direta de um use case sem escrita).
 */
@Component
@RequiredArgsConstructor
public class MesaTabletopNotifierAdapter implements TabletopNotifierPort {

    private final MesaRepository mesaRepository;
    private final CharacterRepository characterRepository;
    private final MesaWebMapper mesaWebMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onFichaStatusAlterada(FichaStatusAlteradaEvent event) {
        List<TokenLocation> locais = mesaRepository.buscarTokensPorCharacterId(event.characterId()).stream()
                .filter(TokenLocation::statusVisivel)
                .toList();
        if (locais.isEmpty()) {
            return;
        }
        FichaStatusSnapshot snapshot = primeiroSnapshot(event.characterId());
        if (snapshot == null) {
            return;
        }
        FichaResumoDto resumo = mesaWebMapper.toFichaResumo(snapshot);
        for (TokenLocation loc : locais) {
            messagingTemplate.convertAndSend("/topic/mesas/" + loc.mesaId(),
                    MesaEvento.ficha(loc.tokenId(), resumo));
        }
    }

    @Override
    public void notificarRolagem(String characterId, RolagemPayload payload) {
        List<TokenLocation> locais = mesaRepository.buscarTokensPorCharacterId(characterId);
        if (locais.isEmpty()) {
            return;
        }
        FichaStatusSnapshot snapshot = primeiroSnapshot(characterId);
        String nome = snapshot != null ? snapshot.nome() : null;
        for (TokenLocation loc : locais) {
            messagingTemplate.convertAndSend("/topic/mesas/" + loc.mesaId(),
                    MesaEvento.rolagem(loc.tokenId(), payload.source(), payload.total(),
                            payload.kind(), payload.critico(), nome));
        }
    }

    private FichaStatusSnapshot primeiroSnapshot(String characterId) {
        return characterRepository.buscarSnapshotsPorIds(List.of(characterId)).stream()
                .findFirst()
                .orElse(null);
    }
}
