package br.com.henrique.bloodcrown_cs.infrastructure.config.realtime;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

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
 *  - SUBSCRIBE em /topic/mesas/{id}: confere que o usuário participa da mesa, impedindo
 *    espionar mesas alheias;
 *  - SEND em /app/mesas/{id}/* (mover/régua ao vivo): confere acesso à mesa, impedindo injetar
 *    eventos em mesas alheias.
 * Pra não bater no banco a cada frame do caminho de alta frequência (drag/régua), o acesso é
 * conferido uma vez por (sessão, mesa) e memorizado nos atributos da sessão WebSocket.
 * Token/assinatura inválidos ou sem acesso lançam exceção, abortando o frame.
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String PREFIXO_TOPICO_MESA = "/topic/mesas/";
    private static final String PREFIXO_APP_MESA = "/app/mesas/";
    private static final String ATTR_MESAS_OK = "mesasAutorizadas";

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
            autorizarMesa(accessor, extrairMesaId(accessor.getDestination(), PREFIXO_TOPICO_MESA));
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            autorizarMesa(accessor, extrairMesaId(accessor.getDestination(), PREFIXO_APP_MESA));
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

    /** Extrai o {id} de "/{prefixo}{id}/..." ou "/{prefixo}{id}"; null se não casar o prefixo. */
    private String extrairMesaId(String destino, String prefixo) {
        if (destino == null || !destino.startsWith(prefixo)) {
            return null;
        }
        String resto = destino.substring(prefixo.length());
        int barra = resto.indexOf('/');
        return barra >= 0 ? resto.substring(0, barra) : resto;
    }

    private void autorizarMesa(StompHeaderAccessor accessor, String mesaId) {
        if (mesaId == null || mesaId.isBlank()) {
            return; // destino fora do escopo de mesa — não restringe aqui
        }
        if (accessor.getUser() == null) {
            throw new MessagingException("Nao autenticado.");
        }
        if (jaAutorizado(accessor, mesaId)) {
            return; // já conferido nesta sessão — evita SELECT por frame no caminho de alta frequência
        }
        if (!mesaRepository.existeComAcesso(mesaId, accessor.getUser().getName())) {
            throw new MessagingException("Voce nao participa desta mesa.");
        }
        marcarAutorizado(accessor, mesaId);
    }

    @SuppressWarnings("unchecked")
    private boolean jaAutorizado(StompHeaderAccessor accessor, String mesaId) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        Object set = attrs != null ? attrs.get(ATTR_MESAS_OK) : null;
        return set instanceof Set && ((Set<String>) set).contains(mesaId);
    }

    @SuppressWarnings("unchecked")
    private void marcarAutorizado(StompHeaderAccessor accessor, String mesaId) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) {
            return;
        }
        ((Set<String>) attrs.computeIfAbsent(ATTR_MESAS_OK, k -> new HashSet<String>())).add(mesaId);
    }
}
