package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CriarMesaUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String userId, String nome) {
        String trimmed = nome == null ? "" : nome.trim();
        if (trimmed.isEmpty()) {
            throw new BadRequestException("Nome da mesa nao pode ser vazio.");
        }
        return mesaRepository.salvar(Mesa.criar(trimmed, userId));
    }
}
