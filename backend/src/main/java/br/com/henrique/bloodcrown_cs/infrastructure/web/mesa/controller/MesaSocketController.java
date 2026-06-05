package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaEvento;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MoverTokenMessage;

import lombok.RequiredArgsConstructor;

/**
 * Adapter STOMP do movimento ao vivo de tokens. Caminho de alta frequência: só repassa a
 * posição pros outros clientes via /topic/mesas/{id}, sem tocar o banco (o estado autoritativo
 * é persistido no drag-end via REST). O acesso ao tópico é validado no SUBSCRIBE pelo
 * StompAuthChannelInterceptor; aqui o porUserId vem do principal pra o cliente ignorar o eco.
 */
@Controller
@RequiredArgsConstructor
public class MesaSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/mesas/{id}/mover")
    public void mover(@DestinationVariable String id, @Payload MoverTokenMessage msg, Principal principal) {
        String userId = principal != null ? principal.getName() : null;
        messagingTemplate.convertAndSend("/topic/mesas/" + id,
                MesaEvento.mover(msg.tokenId(), msg.x(), msg.y(), userId));
    }
}
