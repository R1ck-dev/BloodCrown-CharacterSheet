package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.application.mesa.dto.AdicionarTokenInput;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Adiciona um token ao mapa. O criador vira dono do token. Retorna a mesa atualizada. */
@Service
@RequiredArgsConstructor
public class AdicionarTokenUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, AdicionarTokenInput input) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        Token token = Token.criar(input.nome(), input.imagemUrl(), input.cor(),
                input.x(), input.y(), input.tamanho(), userId);
        mesa.adicionarToken(token, userId);
        return mesaRepository.salvar(mesa);
    }
}
