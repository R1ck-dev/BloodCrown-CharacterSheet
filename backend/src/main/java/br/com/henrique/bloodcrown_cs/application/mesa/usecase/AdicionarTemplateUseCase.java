package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TipoTemplate;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.BadRequestException;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/** Pré-carrega um token (molde) na biblioteca da mesa. */
@Service
@RequiredArgsConstructor
public class AdicionarTemplateUseCase {

    private final MesaRepository mesaRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String nome, String imagemUrl, String tipo,
                        String baseId, String pastaId) {
        if (imagemUrl == null || imagemUrl.isBlank()) {
            throw new BadRequestException("Informe a imagem do item.");
        }
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        String nomeFinal = (nome == null || nome.isBlank()) ? "Item" : nome.trim();
        mesa.adicionarTemplate(
                TokenTemplate.criar(nomeFinal, imagemUrl.trim(), TipoTemplate.from(tipo), baseId, pastaId),
                userId);
        return mesaRepository.salvar(mesa);
    }
}
