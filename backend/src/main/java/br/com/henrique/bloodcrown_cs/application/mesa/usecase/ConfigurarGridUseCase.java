package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Ajusta o grid e a escala de medição de uma cena (tamanho da célula, cor, escala) — só o mestre. */
@Service
@RequiredArgsConstructor
public class ConfigurarGridUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String cenaId, int tamanhoCelula, boolean visivel,
                        String cor, double escalaValor, String escalaUnidade) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.configurarGrid(cenaId, new Grid(tamanhoCelula, visivel, cor), escalaValor, escalaUnidade, userId);
        return mesaRepository.salvar(mesa);
    }
}
