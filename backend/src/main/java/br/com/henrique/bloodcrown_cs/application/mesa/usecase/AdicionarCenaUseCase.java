package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Cria uma cena nova (mapa vazio) e a deixa ativa — só o mestre. */
@Service
@RequiredArgsConstructor
public class AdicionarCenaUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String nome) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.adicionarCena(nome, userId);
        return mesaRepository.salvar(mesa);
    }
}
