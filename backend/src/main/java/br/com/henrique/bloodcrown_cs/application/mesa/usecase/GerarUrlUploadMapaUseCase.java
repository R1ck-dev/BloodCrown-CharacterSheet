package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MediaStoragePort;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MediaStoragePort.UploadAlvo;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Gera a URL PUT pré-assinada (R2) pro mestre subir o mapa. Não persiste nada: depois do
 * upload o cliente chama TrocarMapa com a urlPublica retornada aqui.
 */
@Service
@RequiredArgsConstructor
public class GerarUrlUploadMapaUseCase {

    private final MesaRepository mesaRepository;
    private final MediaStoragePort mediaStoragePort;

    @Transactional(readOnly = true)
    public UploadAlvo execute(String mesaId, String userId, String contentType) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        mesa.garantirDono(userId);
        return mediaStoragePort.gerarUrlUploadMapa(mesa.getId(), contentType);
    }
}
