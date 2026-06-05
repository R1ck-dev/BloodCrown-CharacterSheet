package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Persiste a posição final de um token (chamado no drag-end). O movimento ao vivo durante o
 * arraste trafega só pelo STOMP, sem tocar o banco — aqui grava o estado autoritativo.
 */
@Service
@RequiredArgsConstructor
public class MoverTokenUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String tokenId, int x, int y) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.moverToken(tokenId, x, y, userId);
        return mesaRepository.salvar(mesa);
    }
}
