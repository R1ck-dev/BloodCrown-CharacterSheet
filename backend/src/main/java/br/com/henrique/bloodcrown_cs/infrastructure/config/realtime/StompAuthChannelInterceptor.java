package br.com.henrique.bloodcrown_cs.infrastructure.config.realtime;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.usuario.port.TokenServicePort;

import lombok.RequiredArgsConstructor;

/**
 * Autentica e autoriza o canal STOMP reusando o JWT do REST:
 *  - CONNECT: valida o token do header Authorization via TokenServicePort e fixa o principal
 *    (userId) na sessão WebSocket;
 *  - SUBSCRIBE em /topic/mesas/{id}: confere que o usuário participa da mesa (checagem leve),
 *    impedindo espionar mesas alheias.
 * Token/assinatura inválidos lançam exceção, abortando o frame (CONNECT/SUBSCRIBE recusado).
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String PREFIXO_TOPICO_MESA = "/topic/mesas/";

    private final TokenServicePort tokenServicePort;
    private final MesaRepository mesaRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            accessor.setUser(new StompPrincipal(autenticar(accessor)));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            autorizarInscricao(accessor);
        }
        return message;
    }

    private String autenticar(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;
        if (token == null) {
            throw new MessagingException("Token ausente no CONNECT.");
        }
        String userId = tokenServicePort.obterIdDoUsuario(token); // lança se inválido/expirado
        if (userId == null || userId.isBlank()) {
            throw new MessagingException("Token invalido.");
        }
        return userId;
    }

    private void autorizarInscricao(StompHeaderAccessor accessor) {
        String destino = accessor.getDestination();
        if (destino == null || !destino.startsWith(PREFIXO_TOPICO_MESA)) {
            return; // outros tópicos não são restritos aqui
        }
        if (accessor.getUser() == null) {
            throw new MessagingException("Nao autenticado.");
        }
        String mesaId = destino.substring(PREFIXO_TOPICO_MESA.length());
        if (!mesaRepository.existeComAcesso(mesaId, accessor.getUser().getName())) {
            throw new MessagingException("Voce nao participa desta mesa.");
        }
    }
}
