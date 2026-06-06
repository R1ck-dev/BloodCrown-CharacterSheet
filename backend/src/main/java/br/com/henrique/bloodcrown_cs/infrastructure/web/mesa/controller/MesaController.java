package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.mesa.dto.AdicionarTokenInput;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.AdicionarPastaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.AdicionarTokenUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.BuscarMesaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.ConfigurarGridUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.CriarMesaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.DefinirBaseTemplateUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.DeletarMesaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.EntrarMesaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.ListarMesasUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.AdicionarTemplateUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.MoverTemplateParaPastaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.MoverTokenUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.RedimensionarTokenUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.RemoverPastaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.RemoverTemplateUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.RemoverTokenUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.TrocarMapaMesaUseCase;
import br.com.henrique.bloodcrown_cs.application.mesa.usecase.TrocarVersaoTokenUseCase;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.AdicionarTemplateRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.AdicionarTokenRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.ConfigurarGridRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.CriarMesaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.CriarPastaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.DefinirBaseRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.EntrarMesaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaEvento;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResumoResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MoverTemplatePastaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MoverTokenRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.RedimensionarTokenRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TrocarMapaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TrocarVersaoRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.mapper.MesaWebMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Endpoints REST da mesa tabletop. Todas exigem autenticação (filtro global) e validam posse
 * nos use cases. Mudanças estruturais (mapa/grid/add/remove token) emitem o evento "atualizada"
 * em /topic/mesas/{id} para os clientes re-buscarem o estado. O drag-end só persiste (o
 * movimento ao vivo já trafegou pelo STOMP).
 */
@RestController
@RequestMapping("/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final CriarMesaUseCase criarMesa;
    private final ListarMesasUseCase listarMesas;
    private final BuscarMesaUseCase buscarMesa;
    private final DeletarMesaUseCase deletarMesa;
    private final EntrarMesaUseCase entrarMesa;
    private final TrocarMapaMesaUseCase trocarMapa;
    private final ConfigurarGridUseCase configurarGrid;
    private final AdicionarTokenUseCase adicionarToken;
    private final MoverTokenUseCase moverToken;
    private final RedimensionarTokenUseCase redimensionarToken;
    private final RemoverTokenUseCase removerToken;
    private final AdicionarTemplateUseCase adicionarTemplate;
    private final RemoverTemplateUseCase removerTemplate;
    private final AdicionarPastaUseCase adicionarPasta;
    private final RemoverPastaUseCase removerPasta;
    private final MoverTemplateParaPastaUseCase moverTemplateParaPasta;
    private final DefinirBaseTemplateUseCase definirBaseTemplate;
    private final TrocarVersaoTokenUseCase trocarVersaoToken;
    private final MesaWebMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<MesaResumoResponse>> list(@AuthenticationPrincipal String userId) {
        List<MesaResumoResponse> body = listarMesas.execute(userId).stream()
                .map(m -> mapper.toResumo(m, userId)).toList();
        return ResponseEntity.ok(body);
    }

    @PostMapping
    public ResponseEntity<MesaResponse> create(@Valid @RequestBody CriarMesaRequest req,
                                               @AuthenticationPrincipal String userId) {
        Mesa mesa = criarMesa.execute(userId, req.nome());
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(mesa.getId()).toUri();
        return ResponseEntity.created(location).body(mapper.toResponse(mesa, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MesaResponse> get(@PathVariable String id, @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(mapper.toResponse(buscarMesa.execute(id, userId), userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal String userId) {
        deletarMesa.execute(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/entrar")
    public ResponseEntity<MesaResponse> entrar(@Valid @RequestBody EntrarMesaRequest req,
                                               @AuthenticationPrincipal String userId) {
        Mesa mesa = entrarMesa.execute(userId, req.codigo());
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PutMapping("/{id}/mapa")
    public ResponseEntity<MesaResponse> mapa(@PathVariable String id, @RequestBody TrocarMapaRequest req,
                                             @AuthenticationPrincipal String userId) {
        Mesa mesa = trocarMapa.execute(id, userId, req.mapaUrl());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PutMapping("/{id}/grid")
    public ResponseEntity<MesaResponse> grid(@PathVariable String id, @RequestBody ConfigurarGridRequest req,
                                             @AuthenticationPrincipal String userId) {
        Mesa mesa = configurarGrid.execute(id, userId, req.tamanhoCelula(), req.visivel(), req.cor());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PostMapping("/{id}/tokens")
    public ResponseEntity<MesaResponse> addToken(@PathVariable String id, @RequestBody AdicionarTokenRequest req,
                                                 @AuthenticationPrincipal String userId) {
        Mesa mesa = adicionarToken.execute(id, userId, new AdicionarTokenInput(
                req.nome(), req.imagemUrl(), req.cor(), req.x(), req.y(), req.tamanho(), req.templateId()));
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PutMapping("/{id}/tokens/{tokenId}")
    public ResponseEntity<Void> moveToken(@PathVariable String id, @PathVariable String tokenId,
                                          @RequestBody MoverTokenRequest req,
                                          @AuthenticationPrincipal String userId) {
        moverToken.execute(id, userId, tokenId, req.x(), req.y());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/tokens/{tokenId}/tamanho")
    public ResponseEntity<MesaResponse> resizeToken(@PathVariable String id, @PathVariable String tokenId,
                                                    @RequestBody RedimensionarTokenRequest req,
                                                    @AuthenticationPrincipal String userId) {
        Mesa mesa = redimensionarToken.execute(id, userId, tokenId, req.tamanho());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @DeleteMapping("/{id}/tokens/{tokenId}")
    public ResponseEntity<Void> deleteToken(@PathVariable String id, @PathVariable String tokenId,
                                            @AuthenticationPrincipal String userId) {
        removerToken.execute(id, userId, tokenId);
        notificarAtualizada(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/biblioteca")
    public ResponseEntity<MesaResponse> addTemplate(@PathVariable String id,
                                                    @RequestBody AdicionarTemplateRequest req,
                                                    @AuthenticationPrincipal String userId) {
        Mesa mesa = adicionarTemplate.execute(id, userId, req.nome(), req.imagemUrl(), req.baseId(), req.pastaId());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @DeleteMapping("/{id}/biblioteca/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id, @PathVariable String templateId,
                                               @AuthenticationPrincipal String userId) {
        removerTemplate.execute(id, userId, templateId);
        notificarAtualizada(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/biblioteca/{templateId}/pasta")
    public ResponseEntity<MesaResponse> moveTemplate(@PathVariable String id, @PathVariable String templateId,
                                                     @RequestBody MoverTemplatePastaRequest req,
                                                     @AuthenticationPrincipal String userId) {
        Mesa mesa = moverTemplateParaPasta.execute(id, userId, templateId, req.pastaId());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PutMapping("/{id}/biblioteca/{templateId}/base")
    public ResponseEntity<MesaResponse> setTemplateBase(@PathVariable String id, @PathVariable String templateId,
                                                        @RequestBody DefinirBaseRequest req,
                                                        @AuthenticationPrincipal String userId) {
        Mesa mesa = definirBaseTemplate.execute(id, userId, templateId, req.baseId());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @PostMapping("/{id}/biblioteca/pastas")
    public ResponseEntity<MesaResponse> addPasta(@PathVariable String id, @RequestBody CriarPastaRequest req,
                                                 @AuthenticationPrincipal String userId) {
        Mesa mesa = adicionarPasta.execute(id, userId, req.nome());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    @DeleteMapping("/{id}/biblioteca/pastas/{pastaId}")
    public ResponseEntity<Void> deletePasta(@PathVariable String id, @PathVariable String pastaId,
                                            @AuthenticationPrincipal String userId) {
        removerPasta.execute(id, userId, pastaId);
        notificarAtualizada(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/tokens/{tokenId}/versao")
    public ResponseEntity<MesaResponse> switchVersion(@PathVariable String id, @PathVariable String tokenId,
                                                      @RequestBody TrocarVersaoRequest req,
                                                      @AuthenticationPrincipal String userId) {
        Mesa mesa = trocarVersaoToken.execute(id, userId, tokenId, req.templateId());
        notificarAtualizada(id, userId);
        return ResponseEntity.ok(mapper.toResponse(mesa, userId));
    }

    private void notificarAtualizada(String mesaId, String porUserId) {
        messagingTemplate.convertAndSend("/topic/mesas/" + mesaId, MesaEvento.atualizada(porUserId));
    }
}
