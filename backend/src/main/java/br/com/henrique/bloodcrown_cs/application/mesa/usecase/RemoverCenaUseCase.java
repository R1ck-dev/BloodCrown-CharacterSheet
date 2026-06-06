package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Remove uma cena (e os tokens dela) — só o mestre. Não pode remover a última. */
@Service
@RequiredArgsConstructor
public class RemoverCenaUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String cenaId) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.removerCena(cenaId, userId);
        return mesaRepository.salvar(mesa);
    }
}
