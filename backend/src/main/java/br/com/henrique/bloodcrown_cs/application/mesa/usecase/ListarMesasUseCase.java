package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListarMesasUseCase {

    private final MesaRepository mesaRepository;

    @Transactional(readOnly = true)
    public List<Mesa> execute(String userId) {
        return mesaRepository.listarPorUsuario(userId);
    }
}
