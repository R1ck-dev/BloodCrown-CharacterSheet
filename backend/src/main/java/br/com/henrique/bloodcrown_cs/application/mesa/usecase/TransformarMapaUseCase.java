package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Move/redimensiona o mapa de uma cena e define se ele fica travado como fundo — só o mestre. */
@Service
@RequiredArgsConstructor
public class TransformarMapaUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String cenaId, int x, int y,
                        int largura, int altura, boolean travado) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.transformarMapa(cenaId, x, y, largura, altura, travado, userId);
        return mesaRepository.salvar(mesa);
    }
}
