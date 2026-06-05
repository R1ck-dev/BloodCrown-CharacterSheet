package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Entra numa mesa pelo código de convite, adicionando o usuário aos participantes. */
@Service
@RequiredArgsConstructor
public class EntrarMesaUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String userId, String codigo) {
        String normalizado = codigo == null ? "" : codigo.trim().toUpperCase();
        if (normalizado.isEmpty()) {
            throw new BadRequestException("Informe o codigo da mesa.");
        }
        Mesa mesa = mesaRepository.buscarPorCodigo(normalizado)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada para esse codigo."));
        mesa.entrar(userId);
        return mesaRepository.salvar(mesa);
    }
}
