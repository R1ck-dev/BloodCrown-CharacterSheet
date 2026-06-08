package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Mostra/esconde a barra/selos de status embaixo de um token. Colaborativo. */
@Service
@RequiredArgsConstructor
public class DefinirStatusVisivelTokenUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String tokenId, boolean visivel) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.definirStatusVisivel(tokenId, visivel, userId);
        return mesaRepository.salvar(mesa);
    }
}
