package br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.adapter;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.mapper.MesaMapper;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.mesa.repository.SpringDataMesaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MesaRepositoryAdapter implements MesaRepository {

    private final SpringDataMesaRepository springDataMesaRepository;
    private final MesaMapper mesaMapper;

    @Override
    public Mesa salvar(Mesa mesa) {
        return mesaMapper.toDomain(springDataMesaRepository.save(mesaMapper.toEntity(mesa)));
    }

    @Override
    public Optional<Mesa> buscarPorIdComAcesso(String id, String userId) {
        return springDataMesaRepository.findByIdComAcesso(id, userId).map(mesaMapper::toDomain);
    }

    @Override
    public List<Mesa> listarPorUsuario(String userId) {
        return springDataMesaRepository.listarPorUsuario(userId).stream()
                .map(mesaMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Mesa> buscarPorCodigo(String codigoConvite) {
        return springDataMesaRepository.findByCodigoConvite(codigoConvite).map(mesaMapper::toDomain);
    }

    @Override
    public boolean existeComAcesso(String id, String userId) {
        return springDataMesaRepository.existeComAcesso(id, userId);
    }

    @Override
    public void deletar(String id) {
        springDataMesaRepository.deleteById(id);
    }
}
