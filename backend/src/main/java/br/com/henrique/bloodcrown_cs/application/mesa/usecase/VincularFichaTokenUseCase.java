package br.com.henrique.bloodcrown_cs.application.mesa.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.port.MesaRepository;
import br.com.henrique.bloodcrown_cs.domain.shared.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Vincula (ou desvincula) uma ficha a um token do tabuleiro. Colaborativo no acesso à mesa, mas
 * só permite vincular fichas do próprio usuário (a posse da ficha é validada aqui, pois o domínio
 * Mesa não conhece o agregado Character). characterId nulo/vazio desvincula.
 */
@Service
@RequiredArgsConstructor
public class VincularFichaTokenUseCase {

    private final MesaRepository mesaRepository;
    private final CharacterRepository characterRepository;

    @Transactional
    public Mesa execute(String mesaId, String userId, String tokenId, String characterId) {
        Mesa mesa = mesaRepository.buscarPorIdComAcesso(mesaId, userId)
                .orElseThrow(() -> new NotFoundException("Mesa nao encontrada."));
        if (characterId != null && !characterId.isBlank()) {
            characterRepository.buscarPorIdEUsuario(characterId, userId)
                    .orElseThrow(() -> new NotFoundException("Ficha nao encontrada."));
        }
        mesa.vincularFicha(tokenId, characterId, userId);
        return mesaRepository.salvar(mesa);
    }
}
